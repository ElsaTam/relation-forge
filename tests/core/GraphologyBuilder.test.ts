import { describe, test, expect } from 'bun:test';
import { GraphologyBuilder } from '../../src/core/GraphologyBuilder';

describe('Supporting file extensions for the graph', () => {
    test('Should support md files', () => {
        expect(GraphologyBuilder.shouldAddFileForExtension("md")).toBe(false);
    });
});