import type { OBSTFile } from './Obsidian';

export function shouldAddFile(file: OBSTFile | null): boolean {
	const extension = file?.extension ?? '';
	return extension === 'md';
}
