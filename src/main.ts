import {Plugin} from 'obsidian';
import NextTabPlugin from "./NextTabPlugin";
import {TabShifterPlugin} from "./TabShifterPlugin";

export default class PluginWrapper extends Plugin {
	async onload() {
		// Plugin loaded
		const tabShifter = new TabShifterPlugin(this.app, this.manifest);
		const nextTabber = new NextTabPlugin(this.app, this.manifest);

		tabShifter.onload();
		nextTabber.onload();
	}
}
