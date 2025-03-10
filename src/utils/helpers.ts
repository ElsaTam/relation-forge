import type { OBSTFile } from "src/core/Obsidian";

export function assignDefined<T extends { [key: string]: any }>(target: T, source: Partial<T>): T {
	for (const key of Object.keys(source)) {
		const val = source[key];
		if (val !== undefined) {
			target[key as keyof T] = val;
		}
	}
	return target;
}

export function shouldAddFile(file: OBSTFile | null): boolean {
	const extension = file?.extension ?? '';
	return extension === 'md';
}

export function shouldAddLink(sourceFile: OBSTFile | null, targetFile: OBSTFile | null): boolean {
	return shouldAddFile(sourceFile) && shouldAddFile(targetFile);
}