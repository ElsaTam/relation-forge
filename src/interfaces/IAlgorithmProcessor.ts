import type { MarkdownRenderChild } from "obsidian";
import type { RelationForgeQuery } from "src/internal";

export interface IAlgorithmProcessor {
    executeQuery(query: RelationForgeQuery): any;
    renderResults(el: HTMLElement): MarkdownRenderChild | undefined;
}