// we could support other viewtypes and would need to make this an iterable list
// this could be a setting
import {WorkspaceLeafExtended, WorkspaceTabsExtended} from "./typesUnofficial";

export const supportedViewTypes = 'markdown';
export const DEV=true;

/**
 * @param allLeaves
 * @returns
 *  - map from a leaf (file) to its parent (tab group)
 *  - ordered list of parent tab groups
 */
export const getParentsForEachLeaf =
	(allLeaves: WorkspaceLeafExtended[]) : [
		Map<string, WorkspaceTabsExtended>,
		Array<string>
	] => {
	// map from a tab to its parent
	const allTabGroupsMap : Map<string, WorkspaceTabsExtended> = new Map();
	const allTabGroups : Array<string> = [];	// these are ordered by insertion
	allLeaves.forEach((l, idx) => {
		const leafParent = l.parent;
		// should this actually trigger the whole extension to stop?
		// todo: note that we saw a case where a tab was moved to the sidebar, which should not happen
		if (!leafParent || leafParent.type !== "tabs") {
			console.error(`Unexpected parent of leaf of type ${leafParent.type}, expected 'tabs'. This is not supported 
				and this tab will be skipped`);
			return;
		}
		// new parent group
		if (! allTabGroupsMap.get(leafParent.id)) {
			allTabGroupsMap.set(leafParent.id, leafParent);
			allTabGroups.push(leafParent.id);
		}
	});
	return [allTabGroupsMap, allTabGroups];

}
