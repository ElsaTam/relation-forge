import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import {
	DEFAULT_RANGES,
	type RangeConfiguration,
	RangeRegistry,
	type RelationAttribute
} from '../../src/constants/RangeConfigs';

describe('Test the range registry', () => {
	const type: RelationAttribute = 'influence';
	const config: RangeConfiguration = {
		min: -6,
		max: 3,
		default: 0,
	};

	beforeAll(() => {
		RangeRegistry.register(type, config);
	});
	afterAll(() => {
		RangeRegistry.register(type, DEFAULT_RANGES[type]);
	});

	test("Should properly register a config", () => {
		RangeRegistry.register(type, config);
		expect(RangeRegistry.getConfig(type)).toStrictEqual(config);
	});

	test("Should throw error if minimum is greater than maximum when registering a config", () => {
		expect(() => RangeRegistry.register(type, {
			min: 10,
			max: -10,
			default: 0,
		})).toThrow();
	});

	test("Should throw error if default is not between min and max when registering a config", () => {
		expect(() => RangeRegistry.register(type, {
			min: 10,
			max: -10,
			default: 1000,
		})).toThrow();
	});

	test("Should throw error if minimum is greater than maximum when changing an attribute", () => {
		expect(() => RangeRegistry.registerAttribute(type, 'min', 1000)).toThrow();
	});

	test("Should throw error if default is not between min and max when changing an attribute", () => {
		expect(() => RangeRegistry.registerAttribute(type, 'default', 1000)).toThrow();
	});

	test.each([
		[config, true],
		[{min: 0, max: 0, default: 0}, true],
		[{min: 58, max: 25, default: 33}, false],
		[{min: -12, max: -17, default: -14}, false],
		[{min: -12, max: -7, default: -10}, true],
	])("Should tell if the config %p is valid or not", (c: RangeConfiguration, isValid: boolean) => {
		expect(RangeRegistry.canRegister(c)).toBe(isValid);
	});

	test("Should get the correct config from the registry", () => {
		expect(RangeRegistry.getConfig(type)).toStrictEqual(config);
	});
})
