import {Plugin} from 'obsidian';
import {WorkspaceLeafExtended, WorkspaceTabsExtended} from "./typesUnofficial";

// we could support other viewtypes and would need to make this an iterable list
// this could be a setting
const supportedViewTypes = 'markdown';

export default class TabShifterPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'move-tab-next',
            name: 'Move tab to the next tab group',
            callback: () => this.moveTabToNextGroup(1),
			hotkeys: [
				{
					modifiers: ["Ctrl", "Alt"], // "Mod" is Ctrl on Windows/Linux and Cmd on Mac
					key: ']' // The default hotkey, for example, Ctrl+H or Cmd+H
				}
			]
        });
		this.addCommand({
			id: 'move-tab-prev',
			name: 'Move tab to the prev tab group',
			callback: () => this.moveTabToNextGroup(-1),
			hotkeys: [
				{
					modifiers: ["Ctrl", "Alt"], // "Mod" is Ctrl on Windows/Linux and Cmd on Mac
					key: '[' // The default hotkey, for example, Ctrl+H or Cmd+H
				}
			]
		});
    }

    async moveTabToNextGroup(leftOrRight: -1 | 1) {
		// note that activeLeaf is deprecated
		const activeLeaf = this.app.workspace.activeLeaf as WorkspaceLeafExtended | null;
		if (!activeLeaf) {
			console.log("No active leaf, so cannot move tab to next group");
			return;
		}
		const activeFile = activeLeaf.view.file;
		if (!activeFile) {
			console.log("No active file, can't determine what to open in new tab");
			return;
		}

		// we get all open leaves of type markdown (are there any others we might want?)
        const allLeaves =
			this.app.workspace.getLeavesOfType(supportedViewTypes) as WorkspaceLeafExtended[];
		if (allLeaves.length <= 1) {
			console.log(`0 or 1 leaves; nothing to move`);
			return;
		}

		// so we have at least two leaves; let's get the tab groups, which are the parents of all the leaves
		const allTabGroupsMap : Map<string, WorkspaceTabsExtended> = new Map();
		const allTabGroups : Array<string> = [];	// these are ordered by insertion
		allLeaves.forEach((l, idx) => {
			const leafParent = l.parent;
			if (!leafParent || leafParent.type !== "tabs") {
				console.error("unexpected, cannot continue");
				return;
			}
			if (! allTabGroupsMap.get(leafParent.id)) {
				allTabGroupsMap.set(leafParent.id, leafParent);
				allTabGroups.push(leafParent.id)
			}
		});

		if (allTabGroups.length === 0) {
			console.error("leaves present but no tab groups found");
			return;
		}

		let newLeaf = null;
		if (allTabGroups.length === 1) {
			// if only one tab group, then we need to split
			newLeaf = this.app.workspace.getLeaf('split', 'vertical');
		} else {
			// multiple tab groups, so we're going to move
			// we just take the next group that was originally iterated over and assume it's right
			// the other option would have been to reconstruct the whole view tree
			const leafParentId = activeLeaf.parent.id;
			const idx = allTabGroups.findIndex(x => x === leafParentId);
			let next = idx + leftOrRight;
			if (next >= allTabGroups.length) {
				next = 0;
			} else if (next < 0) {
				next = allTabGroups.length - 1
			}
			const tabGroupToOpenIn = allTabGroupsMap.get(allTabGroups[next])
			if (!tabGroupToOpenIn) {
				throw new Error("invalid control flow");
			}

			const lastIdxInNewTabGroup = tabGroupToOpenIn.children.length
			newLeaf = this.app.workspace.createLeafInParent(
				tabGroupToOpenIn,
				lastIdxInNewTabGroup);
		}

		activeLeaf.detach();
		await newLeaf.openFile(activeFile);
    }
}
