import { describe, expect, test } from 'bun:test';
import { asStatusType } from '../../src/types/StatusType';

describe('Check string types correctly', () => {
	test.each([
		["dead", "dead"],
		["DeAd", "dead"],
		["alive", "alive"],
		["AlIvE", "alive"],
		["maybe", ""],
		["We'll see", ""],
		["", ""],
	])('Should parse %p as the status type %p', (input, output) => {
		expect(asStatusType(input).toString()).toBe(output);
	});
});
