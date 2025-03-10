import Graphology from 'graphology';
import { DataviewAdapter, ElementsParser, shouldAddFile, shouldAddLink } from 'src/internal';
import type { Forge } from './Forge';


export class GraphologyBuilder {
	static build(forge: Forge): Graphology {
		const dv = new DataviewAdapter(forge.app);
		const graph = new Graphology();

		const files = forge.obsidian.getFiles().filter(file => shouldAddFile(file));

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
				if (!this.shouldAddLink(forge, relation.source, relation.target)) continue;

				const targetElement = ElementsParser.parseFromPath(forge, relation.target);
				if (!targetElement) continue;

				if (!graph.hasNode(targetElement.id)) {
					graph.addNode(targetElement.id, {
						type: targetElement.getType(),
						element: targetElement,
					});
				}

				graph.addEdgeWithKey(`${sourceElement.id}->${targetElement.id}`, sourceElement.id, targetElement.id, {
					relation: relation,
				});
			}
		}

		return graph;
	}

	private static shouldAddLink(forge: Forge, source: string, target: string): boolean {
		const sourceFile = forge.obsidian.getFileByPath(source);
		const targetFile = forge.obsidian.getFileByPath(target);
		return shouldAddLink(sourceFile, targetFile);
	}
}
