import { describe, test, expect, spyOn } from 'bun:test';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import { GraphologyBuilder } from 'src/core/GraphologyBuilder';
import Graphology from 'graphology';
import { RelationBuilder } from '../testingUtils/RelationBuilder';
import { newRange } from '../../src/core/NumberRange';
import type { Relation } from '../../src/elements/Relation';
import { ElementBuilder } from '../testingUtils/ElementBuilder';
import type { IElement } from '../../src/interfaces/IElement';
import { PageBuilder } from '../testingUtils/PageBuilder';
import { DEFAULT_SETTINGS } from '../../src/settings/RelationForgeSettings';
import { DEFAULT_RANGES } from '../../src/constants/RangeConfigs';

describe('Build the graph correctly', () => {
	test('Should support md files', () => {
		const page = new PageBuilder().setFileExtension("md").build();
		expect(GraphologyBuilder.shouldAddFile(page)).toBe(true);
	});

	test('Should not support canvas files', () => {
		const page = new PageBuilder().setFileExtension("canvas").build();
		expect(GraphologyBuilder.shouldAddFile(page)).toBe(false);
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
		const relation: Relation = new RelationBuilder().setSource(sourceID).setTarget(targetID).setImpact(newRange('impact', 4)).build();
		const core = new Graphology();
		const edgeID = GraphologyBuilder.getEdgeID(relation)

		// Act
		GraphologyBuilder.addElement(core, source);
		GraphologyBuilder.addElement(core, target);
		GraphologyBuilder.addRelation(core, relation);

		// Assert
		expect(core.getEdgeAttribute(edgeID, "relation")).toStrictEqual(relation);
	});

	test('Should filter and convert all valid pages to corresponding elements', () => {
		// Arrange
		const page1 = new PageBuilder()
			.setFilepath("path/to/page1.md")
			.setFilename("page1")
			.setFileExtension("md")
			.setType("character")
			.build();
		const page2 = new PageBuilder()
			.setFilepath("path/to/page2.md")
			.setFilename("page2")
			.setFileExtension("md")
			.setType("place")
			.build();
		const pageCanvas = new PageBuilder()
			.setFilepath("path/to/pageCanvas.canvas")
			.setFilename("pageCanvas")
			.setFileExtension("canvas")
			.build();

		// Act
		const elements = GraphologyBuilder.getValidElementsFromPages([page1, page2, pageCanvas], DEFAULT_SETTINGS);

		// Assert
		expect(elements).toHaveLength(2);
		expect(elements[0].id).toBe("path/to/page1.md");
		expect(elements[1].id).toBe("path/to/page2.md");
	});

	test('Should add elements to the graph from graphology', () => {
		const relation12 = new RelationBuilder()
			.setSource("path/to/element1.md")
			.setTarget("path/to/element2.md")
			.build();
		const relation13 = new RelationBuilder()
			.setSource("path/to/element1.md")
			.setTarget("path/to/element3.md")
			.build();
		const element1 = new ElementBuilder()
			.setID("path/to/element1.md")
			.addRelation(relation12)
			.addRelation(relation13)
			.build();
		const element2 = new ElementBuilder()
			.setID("path/to/element2.md")
			.build();
		const element3 = new ElementBuilder()
			.setID("path/to/element3.md")
			.build();

		const graph = new Graphology();
		GraphologyBuilder.addElements([element1, element2, element3], graph);
		expect(graph.nodes()).toStrictEqual([
			"path/to/element1.md",
			"path/to/element2.md",
			"path/to/element3.md",
		]);
		expect(graph.edges()).toStrictEqual([
			GraphologyBuilder.getEdgeID(relation12),
			GraphologyBuilder.getEdgeID(relation13),
		]);
	});
});
