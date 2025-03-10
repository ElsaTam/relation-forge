import { describe, test, expect } from 'bun:test';
import { OBSTFile } from 'src/core/Obsidian';
import { shouldAddFile } from 'src/utils/helpers';

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
});