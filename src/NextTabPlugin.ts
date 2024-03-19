import {Plugin} from "obsidian";
import {WorkspaceLeafExtended } from "./typesUnofficial";
import {DEV, supportedViewTypes} from "./share";

export default class NextTabPlugin extends Plugin {
	// note these defaults conflict with nav fwd back...but those seem to do nothing
	async onload() {
		this.addCommand({
			id: 'focus-next-tab',
			name: 'Focus next tab',
			callback: () => this.focusTab(1),
			hotkeys: ! DEV ? undefined : [
				{
					modifiers: ["Meta", "Alt"], // "Mod" is Ctrl on Windows/Linux and Cmd on Mac
					key: 'ArrowRight' // The default hotkey, for example, Ctrl+H or Cmd+H
				}
			]
		});
		this.addCommand({
			id: 'focus-prev-tab',
			name: 'Focus prev tab',
			callback: () => this.focusTab(-1),
			hotkeys: ! DEV ? undefined : [
				{
					modifiers: ["Meta", "Alt"], // "Mod" is Ctrl on Windows/Linux and Cmd on Mac
					key: 'ArrowLeft' // The default hotkey, for example, Ctrl+H or Cmd+H
				}
			]
		});
	};
	async focusTab(leftOrRight: -1 | 1) {
		// note that activeLeaf is deprecated
		const activeLeaf = this.app.workspace.activeLeaf as WorkspaceLeafExtended | null;
		if (!activeLeaf) {
			console.log("No active leaf, so cannot go to next tab");
			return;
		}

		// todo: remove; prob not an issue
		const activeFile = activeLeaf.view.file;
		if (!activeFile) {
			console.log("No active file; not sure if this is an issue; won't change view");
			return;
		}

		// we get all open leaves of type markdown (are there any others we might want?)
		const allLeaves =
			this.app.workspace.getLeavesOfType(supportedViewTypes) as WorkspaceLeafExtended[];
		if (allLeaves.length <= 1) {
			console.log(`0 or 1 leaves; no next/prev tab to go to`);
			return;
		}

		const currIdx = allLeaves.findIndex((leaf) => leaf.id == activeLeaf.id);
		// go left or right (previous or next); deal with running off either end
		let next = currIdx + leftOrRight;
		if (next >= allLeaves.length) {
			next = 0;
		} else if (next < 0) {
			next = allLeaves.length - 1;
		}
		const nextLeaf = allLeaves[next];
		this.app.workspace.setActiveLeaf(nextLeaf, {focus: true})

	}
}
