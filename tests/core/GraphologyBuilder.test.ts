import { describe, test, expect, spyOn } from 'bun:test';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import { OBSTFile } from '../../src/core/Obsidian';
import { GraphologyBuilder } from 'src/core/GraphologyBuilder';
import Graphology from 'graphology';
import type { IRelation } from '../../src/interfaces/IRelation';
import { RelationBuilder } from '../testingUtils/RelationBuilder';
import { newRange } from '../../src/core/NumberRange';
import type { Relation } from '../../src/elements/Relation';
import { ElementBuilder } from '../testingUtils/ElementBuilder';
import type { IElement } from '../../src/interfaces/IElement';

describe('Build the graph correctly', () => {
	test('Should support md files', () => {
		const file: OBSTFile = new OBSTFile({
			basename: "",
			extension: "md",
			name: "",
			path: ""
		});
		expect(GraphologyBuilder.shouldAddFile(file)).toBe(true);
	});

	test('Should not support canvas files', () => {
		const file: OBSTFile = new OBSTFile({
			basename: "",
			extension: "canvas",
			name: "",
			path: ""
		});
		expect(GraphologyBuilder.shouldAddFile(file)).toBe(false);
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
		const spyAddNode = spyOn(core, 'addNode');

		GraphologyBuilder.addElement(core, element);

		expect(spyAddNode).toBeCalledTimes(1);
		expect(core.hasNode("element1")).toBe(true);

		GraphologyBuilder.addElement(core, element);

		expect(spyAddNode).toBeCalledTimes(1);

		element.id = "element2";
		GraphologyBuilder.addElement(core, element);

		expect(spyAddNode).toBeCalledTimes(2);
		expect(core.hasNode("element2")).toBe(true);
	});

	test('Should store the element and its type in the node attributes', () => {
		const element = {
			"id": "element1",
			"name": "Element 1",
			"getType": (): ElementType => "character",
			"relations": [],
			"description": "",
		};
		const core = new Graphology();

		GraphologyBuilder.addElement(core, element);

		expect(core.getNodeAttribute("element1", "type")).toBe("character");
		expect(core.getNodeAttribute("element1", "element")).toStrictEqual(element);
	});

	test('Should store the relation in the link attributes', () => {
		// Arrange
		const sourceID = "source element.md";
		const targetID = "target element.md";
		const source: IElement = new ElementBuilder()
			.setID(sourceID)
			.build();
		const target: IElement = new ElementBuilder()
			.setID(targetID)
			.build();
		const relation: Relation = new RelationBuilder()
			.setSource(sourceID)
			.setTarget(targetID)
			.setImpact(newRange('impact', 4))
			.build();
		const core = new Graphology();
		const edgeID = GraphologyBuilder.getEdgeID(relation)

		// Act
		GraphologyBuilder.addElement(core, source);
		GraphologyBuilder.addElement(core, target);
		GraphologyBuilder.addRelation(core, relation);

		// Assert
		expect(core.getEdgeAttribute(edgeID, "relation")).toStrictEqual(relation);
	});
});
