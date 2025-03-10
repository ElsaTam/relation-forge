import { describe, test, expect } from 'bun:test';
import { shouldAddFileForExtension } from 'src/utils/helpers';

describe('Supporting file extensions for the graph', () => {
    test('Should support md files', () => {
        expect(shouldAddFileForExtension("md")).toBe(true);
    });
    test('Should not support canvas files', () => {
        expect(shouldAddFileForExtension("canvas")).toBe(false);
    });
});