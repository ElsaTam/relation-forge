import type { OBSTFile } from './Obsidian';
import Graphology from 'graphology';
import type { IElement } from '../interfaces/IElement';

export function shouldAddFile(file: OBSTFile | null): boolean {
	const extension = file?.extension ?? '';
	return extension === 'md';
}

export function shouldAddLink(sourceFile: OBSTFile | null, targetFile: OBSTFile | null): boolean {
	return shouldAddFile(sourceFile) && shouldAddFile(targetFile);
}

export function addElement(graph: Pick<Graphology, 'hasNode' | 'addNode'>, element: IElement): void {
	if (!graph.hasNode(element.id)) {
		graph.addNode(element.id, {
			type: element.getType(),
			element: element,
		});
	}
}
