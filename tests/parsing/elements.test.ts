import { describe, expect, test } from 'bun:test';
import { Character } from '../../src/elements/Character';
import type { IPage } from '../../src/core/DataviewAdapter';
import { DEFAULT_SETTINGS } from '../../src/settings/RelationForgeSettings';
import { Relation } from '../../src/elements/Relation';
import { PageBuilder } from '../testingUtils/PageBuilder';
import type { IRelationAttributes } from '../../src/interfaces/IRelation';

describe('Verify that characters are parsed correctly', () => {
	test('Should create a character with the proper name (from the name property)', () => {
		const page: IPage = new PageBuilder()
			.setName('Character 1')
			.build();
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect(character.name).toEqual('Character 1');
	});

	test('Should create a character with the proper name (from the note name)', () => {
		const page: IPage = new PageBuilder()
			.setFilename('Note name')
			.build();
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect(character.name).toEqual('Note name');
	});

	test('Should create a character with the proper description and status', () => {
		const page: IPage = new PageBuilder()
			.setDescription("Testing description")
			.setStatus("dead")
			.build();
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect([character.description, character.status]).toStrictEqual(['Testing description', 'dead']);
	});

	test('Should create a character with empty optional attributes', () => {
		const page: IPage = new PageBuilder().build();
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect([character.description, character.status, character.relations]).toStrictEqual(['', '', []]);
	});
});

describe('Verify that relations are parsed correctly', () => {
	test('Should get the proper labels', () => {
		const page = new PageBuilder()
			.addRelationLink('character', 1, '')
			.addRelationLink('place', 1, '')
			.addRelationLink('event', 1, '')
			.addRelationLink('faction', 1, '')
			.addRelationLink('unknown', 1, '')
			.build();

		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);
		const labels = relations.map(relation => relation.label);

		expect(labels.length).toBe(4);
		expect(labels).toStrictEqual(['character', 'place', 'event', 'faction']);
	});

	test('Should properly create the regex for the types', () => {
		const reg = Relation.getTypesRegex(['character', 'faction']);
		expect(reg).toBe('^(character|faction)_\\d+$');
	});

	test('Should not get undesired labels', () => {
		const page = new PageBuilder()
			.addRelationLink('character', 1, '')
			.addRelationLink('place', 1, '')
			.addRelationLink('event', 1, '')
			.addRelationLink('faction', 1, '')
			.addRelationLink('unknown', 1, '')
			.build();

		const relations = Relation.fromPage(page, DEFAULT_SETTINGS, ['character', 'faction']);
		const labels = relations.map(relation => relation.label);

		expect(labels.length).toBe(2);
		expect(labels).toStrictEqual(['character', 'faction']);
	});

	test.each([
		['type', 'type of the relation'],
		['influence', 7],
		['frequency', 4],
		['origin', 'origin of the relation'],
		['affinity', 7],
		['trust', -2],
		['role', 'role in the relation'],
		['impact', 6],
		['consequence', 'consequence of the relation']
	])('Should correctly parse attribute %p from a relation', (key, value) => {
		// Arrange
		const typedKey = key as keyof IRelationAttributes;
		const attributes: Record<string, string | number> = {};
		attributes[key] = value;
		const page = new PageBuilder()
			.addRelationLink('character', 1, '')
			.addRelationAttributes('character', 1, attributes)
			.build();
		// Guard against changes to the Influence Range
		if (typeof value === 'number') {
			// @ts-ignore
			expect(value).toBeGreaterThanOrEqual(DEFAULT_SETTINGS.rangeProperties[typedKey].min);
			// @ts-ignore
			expect(value).toBeLessThanOrEqual(DEFAULT_SETTINGS.rangeProperties[typedKey].max);
		}

		// Act
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);
		expect(relations.length).toBe(1);

		// Assert
		const relation = relations[0];
		expect(relation).toContainKey(typedKey);
		if (typeof value === 'number') {
			expect(relation[typedKey]).toBeObject();
			// @ts-ignore
			expect(relation[typedKey].value).toBe(value);
		}
		else {
			expect(relation[typedKey]).toBeString();
			expect(relation[typedKey]).toBe(value);
		}
	});


	test.each([
		'type',
		'origin',
		'role',
		'consequence'
	])('Should set to undefined non-existing %p', (key) => {
		// Arrange
		const typedKey = key as keyof IRelationAttributes;
		const page = new PageBuilder()
			.addRelationLink('character', 1, '')
			.build();

		// Act
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);

		// Assert
		expect(relations.length).toBe(1);
		const relation = relations[0];
		expect(relation).toContainKey(key);
		expect(relation[typedKey]).toBeUndefined();
	});

	test.each([
		['influence', 7],
		['affinity', -3],
		['frequency', 2],
		['impact', 5],
		['trust', -6]
	])('Should use the default range value for %p', (key, newValue) => {
		// Arrange
		const typedKey = key as keyof IRelationAttributes;
		const page: IPage = new PageBuilder()
			.addRelationLink('character', 1, '')
			.build();
		expect(page[`character_1_${key}`]).toBeUndefined();
		// Guard against changes to the Influence Range
		// @ts-ignore
		expect(newValue).toBeGreaterThanOrEqual(DEFAULT_SETTINGS.rangeProperties[typedKey].min);
		// @ts-ignore
		expect(newValue).toBeLessThanOrEqual(DEFAULT_SETTINGS.rangeProperties[typedKey].max);
		// @ts-ignore
		DEFAULT_SETTINGS.rangeProperties[typedKey].default = newValue;

		// Act
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);

		// Assert
		expect(relations.length).toBe(1);
		// @ts-ignore
		expect(relations[0][typedKey]?.value).toBe(newValue);
	});
});
