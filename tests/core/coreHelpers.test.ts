import { describe, test, expect } from 'bun:test';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import { shouldAddFile } from '../../src/core/coreHelpers';
import { OBSTFile } from '../../src/core/Obsidian';
import { GraphologyBuilder } from 'src/core/GraphologyBuilder';

type Attributes = Record<string, string | number>;

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
		const core = new Graphology();

		GraphologyBuilder.addElement(core, element);

		expect(core.ids.filter(node => node === element.id).length).toBe(1);
		expect(core.ids.length).toBe(1);

		GraphologyBuilder.addElement(core, element);

		expect(core.ids.filter(node => node === element.id).length).toBe(1);
		expect(core.ids.length).toBe(1);

		element.id = "element2";
		GraphologyBuilder.addElement(core, element);

		expect(core.ids.filter(node => node === element.id).length).toBe(1);
		expect(core.ids.length).toBe(2);
	});
});
