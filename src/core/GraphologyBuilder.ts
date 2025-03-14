import type { Forge } from './Forge';
import Graphology from 'graphology';
import { DataviewAdapter, ElementsParser, type IElement, type IRelation } from 'src/internal';
import type { OBSTFile } from './Obsidian';

export class GraphologyBuilder {
	static build(forge: Forge): Graphology {
		const dv = new DataviewAdapter(forge.app);
		const graph = new Graphology();

		let files = forge.obsidian.getFiles();
		files = files.filter(file => this.shouldAddFile(file));

		for (const sourceFile of files) {
			const sourcePage = dv.page(sourceFile.path);
			const sourceElement = ElementsParser.parse(sourcePage, forge.settings);
			if (!sourceElement) continue;

			const relations = sourceElement.relations;

			this.addElement(graph, sourceElement);

			for (const relation of relations) {
				if (!this.shouldAddFile(forge.obsidian.getFileByPath(relation.target))) continue;

				const targetElement = ElementsParser.parseFromPath(forge, relation.target);
				if (!targetElement) continue;

				this.addElement(graph, targetElement);
			}
		}

		return graph;
	}

	static shouldAddFile(file: OBSTFile | null): boolean {
		const extension = file?.extension ?? '';
		return extension === 'md';
	}

	static addElement(graph: Graphology, element: IElement): void {
		if (!graph.hasNode(element.id)) {
			graph.addNode(element.id, {
				type: element.getType(),
				element: element,
			});
		}
	}

	static addRelation(graph: Graphology, relation: IRelation): void {
		const edgeID = this.getEdgeID(relation);
		if (!graph.hasEdge(edgeID)) {
			graph.addEdgeWithKey(edgeID, relation.source, relation.target, {
				relation: relation,
			});
		}
	}

	static getEdgeID(relation: IRelation): string {
		return `${relation.source}->${relation.target}`;
	}
}
