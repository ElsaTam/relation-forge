import { MarkdownRenderChild, type App } from "obsidian";
import {
    type IAlgorithm,
    type IAlgorithmProcessor,
    type IAlly,
    type IFindAlliesQuery,
    type RelationForgeQuery
} from "src/internal";
import AlliesResults from "../components/AlliesResults.svelte";
import { mount } from "svelte";

export class AlliesProcessor implements IAlgorithmProcessor {
    private component: ReturnType<typeof AlliesResults> | undefined;
    private query: IFindAlliesQuery | undefined;
    private app: App;
    private algorithm: IAlgorithm;
    private results: IAlly[] = [];

    constructor(app: App, algorithm: IAlgorithm) {
        this.app = app;
        this.algorithm = algorithm;
    }

    // Execute the query and return results
    async executeQuery(query: RelationForgeQuery): Promise<any> {
        if (!query.source || !query.target) throw new Error("Invalid query");

        this.query = {
            source: query.source,
            target: query.target,
            options: {
                max: query.options.max ? parseInt(query.options.max) : undefined,
                sort: query.options.sort ? parseInt(query.options.sort) < 0 ? -1 : 1 : undefined,
            }
        }

        return await this.fetchResults();
    }

    async fetchResults(): Promise<IAlly[]> {
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
            this.component = mount(AlliesResults, {
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