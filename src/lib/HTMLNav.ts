export type MaybeElement = Element | Node;

// todo: we could make this proxy everything that follows so that it first casts
export const castElement = (e: MaybeElement): Element => {
	return e as Element;
}
export const elementClassListHasClass = (e: MaybeElement, className: string) => {
	return castElement(e).classList?.contains(className)
}

export const getSingleChildOfClass =
	(e: MaybeElement,
	 className: string,
	 doThrow: boolean = false): MaybeElement | null => {
	e = castElement(e);
	for (const child of Array.from(e.childNodes)) {
		// console.log(`child has classes: ${child.classList}`);
		if (elementClassListHasClass(child, className)) {
			return child;
		}
	}
	if (doThrow) {
		console.log(e.childNodes);
		throw new Error(`className not found in children of element ${e}`);
	}
	return null;
}

// note also checks that first node is instance of what we want
export const traverseClassListToElement = (e: MaybeElement, classList: string[]): Element | null => {
	let node: MaybeElement | null = e;
	let idx = 0;
	if (!elementClassListHasClass(e, classList[0])) {
		return null;
	}
	for (const nextClass of classList.slice(1)) {
		// console.log(`looking for  ${idx} with nextclass: ${nextClass}`);
		node = getSingleChildOfClass(node, nextClass);
		// todo: don't understand why we need this / typing issue
		if (!node) {
			console.log(`no child for ${idx}; return null`);
			return null;
		}
		// console.log(`Got child ${idx} with nextclass: ${nextClass}`);
		idx += 1;
		// console.log('next');
	}
	return castElement(node);
}

// todo: this is not an element function; put in diff helper class
export const simulateMouseEvent = (element: Element) => {
	// Create a new MouseEvent 'click' event
	let event = new MouseEvent('click', {
		bubbles: true,    // Event bubbles up through the DOM
		cancelable: true, // Event can be canceled
		view: window      // Window from which the event is fired
	});

	// Dispatch the event to the target element
	element.dispatchEvent(event);
}
