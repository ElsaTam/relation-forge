import { describe, expect, test } from 'bun:test';
import { Character } from '../../src/elements/Character';
import type { IPage } from '../../src/core/DataviewAdapter';
import { DEFAULT_SETTINGS } from '../../src/settings/RelationForgeSettings';
import { Relation } from '../../src/elements/Relation';
import { PageBuilder } from '../testingUtils/PageBuilder';

describe('Verify that characters are parsed correctly', () => {
	test('Should create a character with the proper name (from the name property)', () => {
		const page: IPage = {
			file: {
				path: '',
				name: 'Note name',
			},
			name: 'Character 1',
		};
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect(character.name).toEqual('Character 1');
	});

	test('Should create a character with the proper name (from the note name)', () => {
		const page: IPage = {
			file: {
				path: '',
				name: 'Note name',
			},
		};
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect(character.name).toEqual('Note name');
	});

	test('Should create a character with the proper description and status', () => {
		const page: IPage = {
			file: {
				path: '',
				name: 'Note name',
			},
			description: 'Testing character',
			status: 'dead',
		};
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect([character.description, character.status]).toStrictEqual(['Testing character', 'dead']);
	});

	test('Should create a character with empty optional attributes', () => {
		const page: IPage = {
			file: {
				path: '',
				name: 'Note name',
			},
		};
		const character = Character.fromPage(page, DEFAULT_SETTINGS);
		expect([character.description, character.status, character.relations]).toStrictEqual(['', '', []]);
	});
});

describe('Verify that relations are parsed correctly', () => {
	test('Should get the proper labels', () => {
		const page: IPage = {
			file: {
				path: 'Path/to/source.md',
				name: '',
			},
			character_1: { path: 'Related Character' },
			place_1: { path: 'Related Place' },
			event_1: { path: 'Related Event' },
			faction_1: { path: 'Related Faction' },
			unknown_1: { path: 'Invalid' },
		};

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
		const page: IPage = {
			file: {
				path: 'Path/to/source.md',
				name: '',
			},
			character_1: { path: 'Related Character' },
			place_1: { path: 'Related Place' },
			event_1: { path: 'Related Event' },
			faction_1: { path: 'Related Faction' },
			unknown_1: { path: 'Invalid' },
		};

		const relations = Relation.fromPage(page, DEFAULT_SETTINGS, ['character', 'faction']);
		const labels = relations.map(relation => relation.label);

		expect(labels.length).toBe(2);
		expect(labels).toStrictEqual(['character', 'faction']);
	});

	test('Should correctly parse all attributes from a relation', () => {
		const page: IPage = {
			file: {
				path: 'Path/to/source.md',
				name: '',
			},
			character_1: { path: 'Related Character' },
			character_1_type: 'type of the relation',
			character_1_influence: 7,
			character_1_frequency: 4,
			character_1_origin: 'origin of the relation',
			character_1_affinity: 7,
			character_1_trust: -2,
			character_1_role: 'role in the relation',
			character_1_impact: 6,
			character_1_consequence: 'consequence of the relation',
		};
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);
		expect(relations.length).toBe(1);

		const relation = relations[0];
		expect([
			relation.source,
			relation.target,
			relation.label,
			relation.type,
			relation.influence.value,
			relation.frequency?.value,
			relation.origin,
			relation.affinity?.value,
			relation.trust?.value,
			relation.role,
			relation.impact?.value,
			relation.consequence,
		]).toStrictEqual([
			page.file.path,
			page.character_1.path,
			'character',
			page.character_1_type,
			page.character_1_influence,
			page.character_1_frequency,
			page.character_1_origin,
			page.character_1_affinity,
			page.character_1_trust,
			page.character_1_role,
			page.character_1_impact,
			page.character_1_consequence,
		]);
	});

	test('Should set to undefined non-existing attributes that are non-numeric', () => {
		const page: IPage = {
			file: {
				path: 'Path/to/source.md',
				name: '',
			},
			character_1: { path: 'Related Character' },
		};
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);
		expect(relations.length).toBe(1);

		const relation = relations[0];
		expect([relation.source, relation.target, relation.label, relation.type, relation.origin, relation.role, relation.consequence]).toStrictEqual([
			page.file.path,
			page.character_1.path,
			'character',
			undefined,
			undefined,
			undefined,
			undefined,
		]);
	});

	test('Should use the default value for a non-existing numeric attribute', () => {
		// Arrange
		const page: IPage = PageBuilder.createFullyPopulatedPage();
		delete page.character_1_influence;
		expect(page.character_1_influence).toBeUndefined();
		DEFAULT_SETTINGS.rangeProperties.influence.default = 7;

		// Act
		const relations = Relation.fromPage(page, DEFAULT_SETTINGS);

		// Assert
		expect(relations.length).toBe(1);
		expect(relations[0].influence.value).toBe(7);
	});
});
