// We extend the Obsidian API to support properties that are usually present.
// Changes would break the extension
import {TFile, View, WorkspaceLeaf, WorkspaceTabs} from "obsidian";

interface ViewUnofficialExtended extends View {
	file?: TFile;
}

interface WorkspaceItemUnofficialExtended {
	id: string;
	parent: WorkspaceItemUnofficialExtended | null;
	type: "leaf" | "tabs" | "split";	// there might be more
}

export interface WorkspaceLeafExtended extends WorkspaceLeaf, WorkspaceItemUnofficialExtended {
	parent: WorkspaceTabsExtended;
	type: "leaf";
	view: ViewUnofficialExtended;
}

export interface WorkspaceTabsExtended extends WorkspaceTabs, WorkspaceItemUnofficialExtended {
	children: WorkspaceLeafExtended[];
	type: "tabs";
	// parent: could be root or split or null?
}
