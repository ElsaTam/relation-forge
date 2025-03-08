import Graphology from 'graphology';
import { App, TFile } from "obsidian";
import { ElementsParser, type RelationForgeSettings } from 'src/internal';
import { getAPI as getDV } from "obsidian-dataview";
import type { Forge } from './Forge';

export class GraphologyBuilder {

    static build(forge: Forge): Graphology {
        const dv = getDV(forge.app);
        const graph = new Graphology();

        const files = forge.app.vault.getFiles().filter(file => GraphologyBuilder.shouldAddFile(file));
        for (const sourceFile of files) {

            const sourcePage = dv.page(sourceFile.path);
            const sourceElement = ElementsParser.parse(sourcePage, forge.settings);
            if (!sourceElement) continue;

            const relations = sourceElement.relations;

            if (!graph.hasNode(sourceElement.id)) {
                graph.addNode(sourceElement.id, {
                    type: sourceElement.getType(),
                    element: sourceElement,
                });
            }

            for (const relation of relations) {
                const targetElement = ElementsParser.parseFromPath(forge, relation.target);
                if (!targetElement) continue;

                if (!graph.hasNode(targetElement.id)) {
                    graph.addNode(targetElement.id, {
                        type: targetElement.getType(),
                        element: targetElement,
                    });
                }

                graph.addEdgeWithKey(`${sourceElement.id}->${targetElement.id}`, sourceElement.id, targetElement.id, {
                    relation: relation
                });
            }
        }

        return graph;
    }

    private static shouldAddFile(file: TFile | null): boolean {
        return !!file && file.extension === "md";
    }

    private static shouldAddLink(app: App, source: string, target: string) {
        return this.shouldAddFile(app.vault.getFileByPath(source)) && this.shouldAddFile(app.vault.getFileByPath(target));
    }
}