import { describe, test, expect } from 'bun:test';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import { addElement, shouldAddFile } from '../../src/core/coreHelpers';
import { OBSTFile } from '../../src/core/Obsidian';

type Attributes = {[name: string]: any};

class Graphology {
	ids: string[] = [];

	hasNode(id: string): boolean {
		return this.ids.includes(id);
	}

	addNode(id: string, attributes?: Attributes | undefined): string {
		this.ids.push(id);
		return id;
	}
}

describe('Build the graph correctly', () => {
	test('Should support md files', () => {
		const file: OBSTFile = new OBSTFile({
			basename: "",
			extension: "md",
			name: "",
			path: ""
		});
		expect(shouldAddFile(file)).toBe(true);
	});

	test('Should not support canvas files', () => {
		const file: OBSTFile = new OBSTFile({
			basename: "",
			extension: "canvas",
			name: "",
			path: ""
		});
		expect(shouldAddFile(file)).toBe(false);
	});

	test('Should add each element only once', () => {
		const element = {
			"id": "element1",
			"name": "Element 1",
			"getType": (): ElementType => "character",
			"relations": [],
			"description": "",
		};
		const graph = new Graphology();

		addElement(graph, element);

		expect(graph.ids.filter(node => node === element.id).length).toBe(1);
		expect(graph.ids.length).toBe(1);

		addElement(graph, element);

		expect(graph.ids.filter(node => node === element.id).length).toBe(1);
		expect(graph.ids.length).toBe(1);

		element.id = "element2";
		addElement(graph, element);

		expect(graph.ids.filter(node => node === element.id).length).toBe(1);
		expect(graph.ids.length).toBe(2);
	});
});
