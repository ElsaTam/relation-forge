import { MarkdownRenderChild, type App } from "obsidian";
import {
    parseBool,
    type IAlgorithm,
    type IAlgorithmProcessor,
    type IInfluencePath,
    type IFindInfluencePathsQuery,
    type RelationForgeQuery,
    isInfluenceModelType
} from "src/internal";
import InfluencePathsResults from "../components/InfluencePathsResults.svelte";
import { mount } from "svelte";
import type { Forge } from "src/core/Forge";

export class InfluencePathsProcessor implements IAlgorithmProcessor {
    #component: ReturnType<typeof InfluencePathsResults> | undefined;
    #query: IFindInfluencePathsQuery | undefined;
    #forge: Forge;
    #algorithm: IAlgorithm;
    #results: IInfluencePath[] = [];

    constructor(forge: Forge, algorithm: IAlgorithm) {
        this.#forge = forge;
        this.#algorithm = algorithm;
    }

    // Execute the query and return results
    async executeQuery(query: RelationForgeQuery): Promise<any> {
        if (!query.source || !query.target) throw new Error("Invalid query: source and target characters are required");

        this.#query = {
            source: query.source,
            target: query.target,
            options: {
                max: query.options.max ? parseInt(query.options.max) : undefined,
                sort: query.options.sort ? parseInt(query.options.sort) < 0 ? -1 : 1 : undefined,
                maxPathLength: query.options.maxPathLength ? parseInt(query.options.maxPathLength) : undefined,
                minRelationInfluence: query.options.minRelationInfluence ? parseFloat(query.options.minRelationInfluence) : undefined,
                includeNegativePaths: query.options.includeNegativePaths ? parseBool(query.options.includeNegativePaths) : undefined,
                influenceModel: isInfluenceModelType(query.options.influenceModel) ? query.options.influenceModel : undefined,
            }
        };

        return await this.fetchResults();
    }

    async fetchResults(): Promise<IInfluencePath[]> {
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
            this.#component = mount(InfluencePathsResults, {
                target: renderChild.containerEl,
                props: {
                    app: this.#forge.app,
                    query: query,
                    fetchResults: this.fetchResults.bind(this),
                }
            });
        };

        return renderChild;
    }
}