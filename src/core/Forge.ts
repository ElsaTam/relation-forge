import { Component, type App } from "obsidian";
import { Algorithms, Graph, MarkdownCodeBlockProcessor, RangeRegistry, type RelationAttribute, type RelationForgeSettings } from "src/internal";
import type RelationForgePlugin from "src/main";
import { Obsidian } from "./Obsidian";

export class Forge extends Component {
    #app: App;
    #obsidian: Obsidian;
    #settings: RelationForgeSettings;
    #plugin: RelationForgePlugin;
    #graph: Graph;
    #algorithms: Algorithms;
    #processor: MarkdownCodeBlockProcessor;
    #isLoaded: boolean = false;

    constructor(plugin: RelationForgePlugin) {
        super();
        this.#plugin = plugin;
        this.#settings = plugin.settings;
        this.#app = plugin.app;
        this.#obsidian = new Obsidian(this.#app);
        this.#graph = new Graph(this);
        this.#algorithms = new Algorithms(this);
        this.#processor = new MarkdownCodeBlockProcessor(this);

        this.addChild(this.#graph);

        for (const [type, config] of Object.entries(this.#settings.rangeProperties)) {
            RangeRegistry.register(type as RelationAttribute, config);
        }

    }

    override onload(): void {
        this.#graph.load();
        this.#plugin.registerMarkdownCodeBlockProcessor('relation-forge', (source, el, ctx) => this.#processor.handleRelationForgeBlock(source, el, ctx));
        this.#isLoaded = true;
    }

    get app(): App { return this.#app; }
    get obsidian(): Obsidian { return this.#obsidian; }
    get settings(): RelationForgeSettings { return this.#settings; }
    get plugin(): RelationForgePlugin { return this.#plugin; }
    get graph(): Graph { return this.#graph; }
    get algorithms(): Algorithms { return this.#algorithms; }
    get isLoaded(): boolean { return this.#isLoaded };
}