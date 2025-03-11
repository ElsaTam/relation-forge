import { describe, expect, test } from 'bun:test';
import { asStatusType } from '../../src/types/StatusType';

describe('Check string types correctly', () => {
	test('Should lowercase correct values and replace by an empty string when not a StatusType', () => {
		const strings = ["dead", "alive", "DeAd", "AlIvE", "maybe", "We'll see", ""];
		const results = strings.map(str => asStatusType(str));
		expect(results).toStrictEqual(["dead", "alive", "dead", "alive", "", "", ""]);
	});
});
