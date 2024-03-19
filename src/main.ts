import {Plugin} from 'obsidian';
import NextTabPlugin from "./plugins/NextTabPlugin";
import {TabShifterPlugin} from "./plugins/TabShifterPlugin";
import * as Obs from "obsidian/obsidian"

type PluginConstructor = new (app: Obs.App, manifest: Obs.PluginManifest) => Plugin;

const pluginList: PluginConstructor[] = [
	TabShifterPlugin,
	NextTabPlugin
]

export default class PluginWrapper extends Plugin {
	pluginInstances: Plugin[] = [];
	async onload() {
		for (const plugin of pluginList) {
			this.pluginInstances.push(new plugin(this.app, this.manifest))
		}
		this.pluginInstances.forEach(p => {
			p.onload();
		})
	}
	async unload() {
		this.pluginInstances.forEach(p => {
			p.unload();
		})
	}
}

