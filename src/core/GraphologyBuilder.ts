import type { Forge } from './Forge';
import Graphology from 'graphology';
import { DataviewAdapter } from '../utils/DataviewAdapter';
import { ElementsParser } from './ElementsParser';
import { addElement, shouldAddFile, shouldAddLink } from './coreHelpers';

export class GraphologyBuilder {
	static build(forge: Forge): Graphology {
		const dv = new DataviewAdapter(forge.app);
		const graph = new Graphology();

		let files = forge.obsidian.getFiles();
		files = files.filter(file => shouldAddFile(file));

		for (const sourceFile of files) {
			const sourcePage = dv.page(sourceFile.path);
			const sourceElement = ElementsParser.parse(sourcePage, forge.settings);
			if (!sourceElement) continue;

			const relations = sourceElement.relations;

			addElement(graph, sourceElement);

			for (const relation of relations) {
				if (!shouldAddFile(forge.obsidian.getFileByPath(relation.target))) continue;

				const targetElement = ElementsParser.parseFromPath(forge, relation.target);
				if (!targetElement) continue;

				addElement(graph, targetElement);

				graph.addEdgeWithKey(`${sourceElement.id}->${targetElement.id}`, sourceElement.id, targetElement.id, {
					relation: relation,
				});
			}
		}

		return graph;
	}
}
