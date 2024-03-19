import {castElement, getSingleChildOfClass, MaybeElement, simulateMouseEvent} from "./HTMLNav";

// A safe wrapper class for elements in the dom
export abstract class BaseElement {
	elementClass: string;
	e: Element;
	n: Node;
	constructor(e: MaybeElement, elementClass: string) {
		this.elementClass = elementClass;
		this.e = castElement(e);
		if (!this.e.classList.contains(this.elementClass)) {
			throw new Error("invalid");
		}
		this.n = e as Node;
	}
	abstract click(): void
}

export class SyncHistoryList extends BaseElement {
	constructor(e: MaybeElement) {
		super(e, "sync-history-list");
	}
	listItems () {
		return Array.from(this.e.childNodes).map(c => new SyncHistoryListItem(c));
	}
	click () {
		throw new Error("invalid");
	}
}

export class VersionGroupItem extends BaseElement {
	constructor(e: MaybeElement) {
		super(e, "version-group-item");
	}
	click () {
		simulateMouseEvent(this.e);
	}
}
export class VersionGroupContainer extends BaseElement {
	_versionGroupItems: VersionGroupItem[];
	constructor(e: MaybeElement) {
		super(e, "version-group-container");
	}

	// todo(getters): getter
	get versionGroupItems() {
		if (this._versionGroupItems) {
			return this._versionGroupItems;
		}
		if (!this.n.childNodes || this.n.childNodes.length === 0) {
			// todo(getters): how to have fewer returns in these getters
			this._versionGroupItems = [];
			return [];
		}
		const versionGroupItems =
			Array.from(this.n.childNodes)
				// throw away the first one which is a connector
				.slice(1)
				.map(c => new VersionGroupItem(c));
		// remove the first element which is a design div
		this._versionGroupItems = versionGroupItems
		return this._versionGroupItems;
	}
	click () {
		// todo(low): better method to make sure it is not clicked/ not supported? (e.g. doesnt implement / doesnt fully inherit)
		throw new Error("version group container should not be clicked")
	}
}

export class SyncHistoryListItem extends BaseElement {
	// todo(low) any other way to define this somewhere?
	childVersionGroupContainer: VersionGroupContainer | null;
	constructor(e: MaybeElement) {
		super(e, "sync-history-list-item");
	}

	click() {
		// todo(low)...clean up a little / pretter?)
		// will click on sync-history-list-item-header
		simulateMouseEvent(this.e.childNodes[0] as Element);
	}

	get isActive() {
		// todo(lower): we could create a class for the Header
		const syncHistoryListItemHeader = this.e.childNodes[0];
		return castElement(syncHistoryListItemHeader).classList.contains('is-active');
	}

	get isExpanded() {
		if (!this.getChildVersionGroupContainer) {
			return false;
		}
		console.log(`visibility of group is ${window.getComputedStyle(this.getChildVersionGroupContainer.e).display}`);
		const versionGroupVisible = window.getComputedStyle(this.getChildVersionGroupContainer.e).display !== 'none';

		const isExpanded = versionGroupVisible;
		console.log(`is expanded: ${isExpanded}`);
		return isExpanded;
	}

	toggleExpand() {
		// sync-history-list-item-header -> tree-item-flair-outer
		const header =
			getSingleChildOfClass(this.e, 'sync-history-list-item-header', true);
		const clickable =
			getSingleChildOfClass(header!, 'tree-item-flair-outer', true);

		// we have to click on the child of tree-item-flair-outer
		simulateMouseEvent(clickable!.childNodes[0] as Element);
	}

	// last child (class version-group-container)
	// todo(lower): are my getters and setters messed up
	get getChildVersionGroupContainer() : VersionGroupContainer | null {
		if (this.childVersionGroupContainer) {
			return this.childVersionGroupContainer;
		}
		if (!this.n.lastChild) {
			return null;
		}
		this.childVersionGroupContainer = new VersionGroupContainer(this.n.lastChild);
		return this.childVersionGroupContainer;
	}

	// todo(getter)
	nextSiblingInList() {
		if (this.e.nextSibling) {
			return new SyncHistoryListItem(this.e.nextSibling);
		}
		return null;
	}

	prevSiblingInList() {
		if (this.e.previousSibling) {
			return new SyncHistoryListItem(this.e.previousSibling);
		}
		return null;
	}
}
