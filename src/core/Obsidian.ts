import type { App, TFile } from 'obsidian';

export class OBSTFile {
	basename: string;
	extension: string;
	name: string;
	path: string;

	constructor(file: {
		basename: string,
		extension: string,
		name: string,
		path: string
	}) {
		this.basename = file.basename;
		this.extension = file.extension;
		this.name = file.name;
		this.path = file.path;
	}
}

export class Obsidian {
	#app: App;

	constructor(app: App) {
		this.#app = app;
	}

	getFiles(): OBSTFile[] {
		return this.#app.vault.getFiles().map(file => new OBSTFile(file));
	}

	getFileByPath(path: string): OBSTFile | null {
		const file = this.#app.vault.getFileByPath(path);
		return file ? new OBSTFile(file) : null;
	}
}
