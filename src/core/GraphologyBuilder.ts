import type { Forge } from './Forge';
import Graphology from 'graphology';
import { DataviewAdapter, ElementsParser, type IElement, type IPage, type IRelation, type RelationForgeSettings } from 'src/internal';

export class GraphologyBuilder {
	static build(forge: Pick<Forge, 'settings' | 'app'>): Graphology {
		const pages = new DataviewAdapter(forge.app).pages();
		const elements = this.getValidElementsFromPages(pages, forge.settings);

		const graph = new Graphology();
		this.addElements(elements, graph);
		return graph;
	}

	static getValidElementsFromPages(pages: IPage[], settings: RelationForgeSettings): IElement[] {
		return pages.reduce((acc: IElement[], page: IPage) => {
			if (!this.shouldAddFile(page)) return acc;
			const element = ElementsParser.parse(page, settings);
			if (element) {
				acc.push(element);
			}
			return acc;
		}, []);
	}

	static addElements(elements: IElement[], graph: Graphology): void {
		for (const sourceElement of elements) {
			const relations = sourceElement.relations;

			this.addElement(graph, sourceElement);

			for (const relation of relations) {
				const targetElement = elements.find(el => el.id === relation.target);
				if (!targetElement) continue;

				this.addElement(graph, targetElement);
				this.addRelation(graph, relation);
			}
		}
	}

	static shouldAddFile(page: IPage | null): boolean {
		return (page?.file.ext ?? '') === 'md';
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
