import { Plugin } from 'obsidian';
import {
	Algorithms,
	DataviewAdapter,
	DEFAULT_SETTINGS,
	Graph,
	MarkdownCodeBlockProcessor,
	RangeRegistry,
	type RelationAttribute,
	type RelationForgeSettings,
	RelationForgeSettingTab
} from './internal';
import { Forge } from './core/Forge';

export default class RelationForgePlugin extends Plugin {
	settings: RelationForgeSettings = DEFAULT_SETTINGS;
	forge: Forge | null = null;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new RelationForgeSettingTab(this.app, this, this.settings));

		// @ts-ignore
		this.registerEvent(this.app.metadataCache.on("dataview:index-ready", () => {
			this.init();
		}));

		DataviewAdapter.waitForAPI(this.app)
			.then(() => {
				if (DataviewAdapter.isInitialized(this.app)) {
					this.init();
				}
			})
			.catch(() => {
				console.error("Dataview API not found");
			});
	}

	private init() {
		if (this.forge) return;
		this.forge = new Forge(this);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async waitForDataview() {

	}
}


