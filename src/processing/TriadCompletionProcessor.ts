import { MarkdownRenderChild, Notice, type App } from "obsidian";
import {
    parseBool,
    type IAlgorithm,
    type IAlgorithmProcessor,
    type ICompleteTriadQuery,
    type ITriadCompletionRecommendation,
    type RelationForgeQuery,
} from "src/internal";
import TriadCompletionResults from "../components/TriadCompletionResults.svelte";
import { mount } from "svelte";
import type { Forge } from "src/core/Forge";

export class TriadCompletionProcessor implements IAlgorithmProcessor {
    #component: ReturnType<typeof TriadCompletionResults> | undefined;
    #query: ICompleteTriadQuery | undefined;
    #forge: Forge;
    #algorithm: IAlgorithm;
    #results: ITriadCompletionRecommendation[] = [];

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
                considerFactions: query.options.considerFactions ? parseBool(query.options.considerFactions) : undefined,
                minRelationshipStrength: query.options.minRelationshipStrength ? parseFloat(query.options.minRelationshipStrength) : undefined,
                preferPositiveRelationships: query.options.preferPositiveRelationships ? parseBool(query.options.preferPositiveRelationships) : undefined,
                allowBidirectional: query.options.allowBidirectional ? parseBool(query.options.allowBidirectional) : undefined,
            }
        }

        return await this.fetchResults();
    }

    async fetchResults(): Promise<ITriadCompletionRecommendation[]> {
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
            this.#component = mount(TriadCompletionResults, {
                target: renderChild.containerEl,
                props: {
                    app: this.#forge.app,
                    query: query,
                    fetchResults: this.fetchResults.bind(this),
                    createRelation: this.createRelation.bind(this),
                }
            });
        }

        return renderChild;
    }

    async createRelation(completion: ITriadCompletionRecommendation): Promise<void> {
        return completion.newRelation.create(this.#forge)
            .then(() => {
                new Notice("Relation created in " + completion.newRelation.source);
            }).catch((error) => {
                new Notice("Impossible to create relation.");
                console.error(error);
            });
    }
}