// todo(later): need to support
// - load more selection
// todo(later) check memory leaks
// review all uses of Element rather than our BaseElement

import {Plugin} from "obsidian";
import * as E from '../lib/HTMLNav';
import {elementClassListHasClass} from '../lib/HTMLNav';
import {BaseElement, SyncHistoryList, SyncHistoryListItem, VersionGroupItem} from "../lib/HistoryModalElements";


const syncHistoryModalClassList = [
	'modal-container',
	'mod-sync-history',

	'modal-content',
	'sync-history-list-container',
	'sync-history-list',
];

/* structure
sync-history-list
	sync-history-list-item
		sync-history-list-item-header [is-active]
			tree-item-flair-outer
			tree-item-flair (not important)
		version-group-container
			connecting-line (ignore)
			version-group-item

 */

// todo(refactorClass): refactor this plugin to support other similar functionalities
export class ArrowNavPlugin extends Plugin {
	// todo(refactorClass) - pass this in from constructor
	targetElementClassList = syncHistoryModalClassList;

	openObserver: MutationObserver | null;
	closeObserver: MutationObserver | null;

	// todo: this is syncHistoryList
	primaryElement: SyncHistoryList;

	boundKeyPressHandler: (...args: any[]) => void;

	// todo(refactorClass): move to base class
	// ---BASE CLASS
	// todo(refactorClass): write constructor
	// - set targetElementClassList
	async onload() {
		console.log("loading arrownav");

		// basic setup - todo(low): move to constructor?; not sure how plugins work
		this.makeOpenObserver();
		this.makeCloseObserver();

		// todo(low): think about: add subtree true to get subnodes; but we are actually walking down the class list
		// note that this is unparallel to close observer; we leave this one litsening the whole time where as closeobserver gets disconnected
		this.openObserver!.observe(document.body, {childList: true, subtree: false})
	}

	async unload() {
		console.log("calling unload");
		this.openObserver?.disconnect();
		// these two lines are the same as onTargetEltDisappears
		this.closeObserver?.disconnect();
		window.removeEventListener('keydown', this.boundKeyPressHandler)
		// todo(low): not sure we need
		super.unload();
	}
	makeOpenObserver () {
		this.openObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				// todo(low): is this helpful
				// if (mutation.type !== 'childList') {
				// 	continue;
				// }
				for (const node of Array.from(mutation.addedNodes)) {
					const tgtElt =
						E.traverseClassListToElement(node, this.targetElementClassList);
					if (!tgtElt) {
						continue;
					}
					this.onFoundTargetElt(tgtElt);
					break;
				}
			}
		});
	}

	makeCloseObserver() {
		this.closeObserver = new MutationObserver(mutations => {
			// console.log(`looking for ${eltToWatch.className}`);
			for (const mutation of mutations) {
				// Check for removed nodes in the mutation record
				for (const removedNode of Array.from(mutation.removedNodes)) {
					const tgtElt =
						E.traverseClassListToElement(removedNode, this.targetElementClassList);
					if (!tgtElt) {
						continue;
					}
					console.log("******** removing!")
					this.onTargetEltDisappears();
					break;
				}
			}
		});
	}

	// called when a target element is identified
	onFoundTargetElt (tgtElt: Element) {
		// todo(low): maybe disconnect openobserver?
		console.log(`found tgtElt w id ${tgtElt.id}`);
		this.closeObserver!.observe(document.body, { childList: true, subtree: true });
		this.primaryElement = new SyncHistoryList(tgtElt);
		this.boundKeyPressHandler = this.handleKeyPress.bind(this);
		window.addEventListener('keydown', this.boundKeyPressHandler)
	}

	onTargetEltDisappears () {
		this.closeObserver?.disconnect();
		window.removeEventListener('keydown', this.boundKeyPressHandler)
	}

	// --- end baseclass

	handleKeyPress(e: KeyboardEvent) {
		if (!this.primaryElement) {
			throw new Error("control flow");
		}
		// todo(later): set handled keypresses
		if (! ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].contains(e.key)) {
			return;
		}
		console.log(`valid key: ${e.key}`);
		// find active child item
		const activeSyncHistoryListItem =
			this.primaryElement.listItems().find(i => i.isActive);
		if (!activeSyncHistoryListItem) {
			throw new Error("control flow");
		}
		if (e.key === "ArrowRight") {
			if (!activeSyncHistoryListItem.isExpanded) {
				activeSyncHistoryListItem.toggleExpand();
			}
			return;
		} else if (e.key === "ArrowLeft") {
			if (activeSyncHistoryListItem.isExpanded) {
				activeSyncHistoryListItem.toggleExpand();
			}
			return;
		}

		// otherwise up /down
		let nextActive: BaseElement | null;
		if (e.key === "ArrowDown") {
			nextActive = this.next(activeSyncHistoryListItem);
		} else if (e.key === "ArrowUp") {
			nextActive = this.prev(activeSyncHistoryListItem);
		} else {
			throw new Error("invalid control flow");
		}
		// e.g. if we are at the end
		if (!nextActive) {
			return;
		}
		console.log(nextActive);
		nextActive.click();
	}


	// list traversal -----
	// todo(lower): maybe clean these up further - read them simultaneously
	getActiveFromExpanded (versionListItems: VersionGroupItem[]): number {
		console.log(`NEXT expanded have something to choose; length of list is ${versionListItems.length}`);
		// look for whether one of the ones in this list is active
		let activeSubVersionIdx = -1;
		for (let i = 0; i < versionListItems.length; i++) {
			const versionItem = versionListItems[i];
			if (elementClassListHasClass(versionItem.e, 'is-active')) {
				console.log(`found one that is expanded at idx ${i}`);
				activeSubVersionIdx = i;
				break;
			}
		}
		return activeSubVersionIdx;
	}
	prev (syncHistListItem: SyncHistoryListItem): BaseElement | null {
		const getForPrevSibling = (prevSiblingAsSyncHistListItem: SyncHistoryListItem | null): BaseElement | null => {
			if (!prevSiblingAsSyncHistListItem) {
				// no prev sibling (e.g. at end of list)
				return null;
			}
			// const prevSiblingAsSyncHistListItem =
			// 	new SyncHistoryListItem(sibling);
			// if it's not expanded, just return itself
			if (!prevSiblingAsSyncHistListItem.isExpanded) {
				console.log("prev sibling not expanded");
				return prevSiblingAsSyncHistListItem;
			}
			// probably can never happen, but make sure there is at least one item
			if (prevSiblingAsSyncHistListItem.childVersionGroupContainer?.versionGroupItems?.length === 0) {
				console.log("is this happening");
				return prevSiblingAsSyncHistListItem;
			}
			console.log("return the last one in the above list");
			// if it is expanded
			// sort of hacky, but we know that the item is expanded, that it has at least one child, and that none of its items are expanded yet
			return this.next(prevSiblingAsSyncHistListItem, true);
		}
		// if not expanded, just next sib
		if (!syncHistListItem.isExpanded) {
			return getForPrevSibling(syncHistListItem.prevSiblingInList());
		}
		// expanded...so see if one is active
		console.log("expanded, so we're going to check");
		const versionListItems = syncHistListItem.childVersionGroupContainer?.versionGroupItems;
		if (!versionListItems || versionListItems.length === 0) {
			// no items in the list, so just prev sib
			return getForPrevSibling(syncHistListItem.prevSiblingInList());
		}
		console.log("expanded and have something to choose");
		// look for whether one of the ones in this list is active
		const activeSubVersionIdx = this.getActiveFromExpanded(versionListItems)
		// expanded but nothing active there
		if (activeSubVersionIdx === -1) {
			console.log(`nothing is expanded yet in the sublist; return first item`);
			return getForPrevSibling(syncHistListItem.prevSiblingInList());
		}
		// otherwise, one is active
		if (activeSubVersionIdx === 0) {
			// at beg of list - return this item itself
			return syncHistListItem;
		} else {
			// not at beg of list, so go back one
			return versionListItems[activeSubVersionIdx - 1];
		}
	}

	next (syncHistListItem: SyncHistoryListItem, useLastItem: boolean = false): BaseElement | null {
		// if not expanded, just next sib
		if (!syncHistListItem.isExpanded) {
			return syncHistListItem.nextSiblingInList();
		}
		//expanded...so see if we have any active
		console.log("expanded, so we're going to check");
		const versionListItems = syncHistListItem.childVersionGroupContainer?.versionGroupItems;
		if (!versionListItems || versionListItems.length === 0) {
			// no items in the list, so just next sib
			return syncHistListItem.nextSiblingInList();
		}
		const activeSubVersionIdx = this.getActiveFromExpanded(versionListItems)
		// none are active yet
		if (activeSubVersionIdx === -1) {
			console.log(`nothing is expanded yet in the sublist; return first item`);
			// todo hack to reuse other code
			if (useLastItem) {
				return versionListItems[versionListItems.length - 1];
			}
			return versionListItems[0];
		}
		// otherwise, one is active
		// todo(typing): exclamations (and compare to the other function, too); and do this elsewhere
		if (activeSubVersionIdx < syncHistListItem.childVersionGroupContainer?.versionGroupItems!.length! - 1) {
			// not at end of list
			return versionListItems[activeSubVersionIdx + 1];
		} else {
			return syncHistListItem.nextSiblingInList();
		}
	}
	// --- end list traversal
}
