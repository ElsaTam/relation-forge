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
import type { Forge } from "src/core/Forge";

export class AlliesProcessor implements IAlgorithmProcessor {
    #component: ReturnType<typeof AlliesResults> | undefined;
    #query: IFindAlliesQuery | undefined;
    #forge: Forge;
    #algorithm: IAlgorithm;
    #results: IAlly[] = [];

    constructor(forge: Forge, algorithm: IAlgorithm) {
        this.#forge = forge;
        this.#algorithm = algorithm;
    }

    // Execute the query and return results
    async executeQuery(query: RelationForgeQuery): Promise<any> {
        if (!query.source || !query.target) throw new Error("Invalid query");

        this.#query = {
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
        if (!this.#query) return [];
        this.#results = await this.#algorithm.exec(this.#query);
        return this.#results;
    }

    // Render results based on display option
    renderResults(el: HTMLElement): MarkdownRenderChild | undefined {
        if (!this.#query) return;
        const query = this.#query;

        const renderChild = new MarkdownRenderChild(el);
        renderChild.onload = () => {
            this.#component = mount(AlliesResults, {
                target: renderChild.containerEl,
                props: {
                    app: this.#forge.app,
                    query: query,
                    fetchResults: this.fetchResults.bind(this),
                }
            });
        }

        return renderChild;
    }
}