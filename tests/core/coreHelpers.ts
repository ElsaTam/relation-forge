import { describe, test, expect } from 'bun:test';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import { addElement, shouldAddFile, shouldAddLink } from '../../src/core/coreHelpers';
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

describe('Supporting file extensions for the graph', () => {
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

	test('Should support links between two md files', () => {
		const file: OBSTFile = new OBSTFile({
			basename: "",
			extension: "md",
			name: "",
			path: ""
		});
		expect(shouldAddLink(file, file)).toBe(true);
	});

	test('Should not support link with a canvas file', () => {
		const fileMD: OBSTFile = new OBSTFile({
			basename: "",
			extension: "md",
			name: "",
			path: ""
		});
		const fileCanvas: OBSTFile = new OBSTFile({
			basename: "",
			extension: "canvas",
			name: "",
			path: ""
		});
		expect(shouldAddLink(fileMD, fileCanvas)).toBe(false);
		expect(shouldAddLink(fileCanvas, fileMD)).toBe(false);
		expect(shouldAddLink(fileCanvas, fileCanvas)).toBe(false);
	});
});

describe('Build the graph correctly', () => {
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
