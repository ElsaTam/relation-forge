import {
    Algorithms,
    parseBool,
    type IAlgorithm,
    type IAlgorithmProcessor,
    type IFindUnstableTriadsQuery,
    type ITriad
} from "src/internal";
import type {
    RelationForgeQuery
} from "../types/RelationForgeQuery";
import TriadsResults from "../components/TriadsResults.svelte";
import { MarkdownRenderChild, type App } from "obsidian";
import { mount } from "svelte";

export class UnstableTriadsProcessor implements IAlgorithmProcessor {
    private component: ReturnType<typeof TriadsResults> | undefined;
    private query: IFindUnstableTriadsQuery | undefined;
    private app: App;
    private algorithm: IAlgorithm;
    private results: ITriad[] = [];

    constructor(app: App, algorithm: IAlgorithm) {
        this.app = app;
        this.algorithm = algorithm;
    }

    // Execute the query and return results
    async executeQuery(query: RelationForgeQuery): Promise<any> {
        this.query = {
            options: {
                max: query.options.max ? parseInt(query.options.max) : undefined,
                sort: query.options.sort ? parseInt(query.options.sort) < 0 ? -1 : 1 : undefined,
                considerFactions: query.options.considerFactions ? parseBool(query.options.considerFactions) : undefined,
                minRelationshipStrength: query.options.minRelationshipStrength ? parseFloat(query.options.minRelationshipStrength) : undefined,
                minTension: query.options.minTension ? parseFloat(query.options.minTension) : undefined,
                onlyCompleteTriads: query.options.onlyCompleteTriads ? parseBool(query.options.onlyCompleteTriads) : undefined,
            }
        };

        return await this.fetchResults();
    }

    async fetchResults(): Promise<ITriad[]> {
        if (!this.query) return [];
        this.results = await this.algorithm.exec(this.query);
        return this.results;
    }

    // Render results based on display option
    renderResults(el: HTMLElement): MarkdownRenderChild | undefined {
        if (!this.query) return;
        const query = this.query;

        const renderChild = new MarkdownRenderChild(el);
        renderChild.onload = () => {
            this.component = mount(TriadsResults, {
                target: renderChild.containerEl,
                props: {
                    app: this.app,
                    query: query,
                    fetchResults: this.fetchResults.bind(this),
                }
            });
        }

        return renderChild;
    }
}