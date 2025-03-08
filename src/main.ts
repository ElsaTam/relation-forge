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

export default class RelationForgePlugin extends Plugin {
	settings: RelationForgeSettings = DEFAULT_SETTINGS;
	initialized: boolean = false;

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
		if (this.initialized) return;
		// Register ranges
		for (const [type, config] of Object.entries(this.settings.ranges)) {
			RangeRegistry.register(type as RelationAttribute, config);
		}

		const graph = new Graph(this.app, this.settings);
		const algorithms = new Algorithms(graph, this.settings);
		const processor = new MarkdownCodeBlockProcessor(this.app, this.settings, algorithms);
		this.registerMarkdownCodeBlockProcessor('relation-forge', (source, el, ctx) => processor.handleRelationForgeBlock(source, el, ctx));
		this.initialized = true;
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


