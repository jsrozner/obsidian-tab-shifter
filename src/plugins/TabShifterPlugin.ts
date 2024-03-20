/*
Todo (missing functionalities):
- exclude left/right sidepanes; see below
- support initial left split (see below)
 */
import {Plugin} from "obsidian";
import { getParentsForEachLeaf, supportedViewTypes} from "../share";
import {WorkspaceLeafExtended} from "../typesUnofficial";
import {getEnvVars} from "../env";

const env = getEnvVars();

export class TabShifterPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'move-tab-next',
			name: 'Move tab to the next tab group',
			callback: () => this.moveTabToNextGroup(1),
			hotkeys: env.dev ? undefined : [
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
			hotkeys: env.dev ? undefined : [
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

		// todo: we need to exclude left and right sidepanes, which can get inlcuded if a markdown file is added there

		// so we have at least two leaves; let's get the tab groups, which are the parents of all the leaves
		const [allTabGroupsMap, allTabGroups] =
			getParentsForEachLeaf(allLeaves);

		if (allTabGroups.length === 0) {
			console.error("leaves present but no tab groups found");
			return;
		}

		// the way we open the tab in the new group is to
		// - create a new leaf
		// - open the same file as the active file there
		// - close the existing leaf
		let newLeaf = null;
		if (allTabGroups.length === 1) {
			// if only one tab group, then we need to split (currently splits right)
			// todo support initial split left
			newLeaf = this.app.workspace.getLeaf('split', 'vertical');
		} else {
			// multiple tab groups, so we're going to move
			// we just take the next group that was originally iterated over and assume it's correct
			// another option would be to reconstruct the whole view tree, but the behavior might actually be the same
			const leafParentId = activeLeaf.parent.id;
			// note that "tab groups" are actually a different functionality in obsidian, but here we
			// use it to refer to the parent object of type 'tabs'
			const currentTabGroupIndex = allTabGroups.findIndex(x => x === leafParentId);

			// go left or right (previous or next); deal with running off either end
			let next = currentTabGroupIndex + leftOrRight;
			if (next >= allTabGroups.length) {
				next = 0;
			} else if (next < 0) {
				next = allTabGroups.length - 1;
			}
			const tabGroupToOpenIn = allTabGroupsMap.get(allTabGroups[next])
			if (!tabGroupToOpenIn) {
				throw new Error("invalid control flow: expected tab group does not exist. Please file a bug");
			}

			// open at the end of the tab group
			const lastIdxInNewTabGroup = tabGroupToOpenIn.children.length
			newLeaf = this.app.workspace.createLeafInParent(
				tabGroupToOpenIn,
				lastIdxInNewTabGroup);
		}

		// close existing leaf and open the current file in the newly created leaf
		activeLeaf.detach();
		await newLeaf.openFile(activeFile);
	}
}
