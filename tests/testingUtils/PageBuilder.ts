import type { IPage } from '../../src/core/DataviewAdapter';

export class PageBuilder {
	private file: Record<string, string> = {
		path: "",
		name: "",
		ext: "",
	};
	private type?: string;
	private name?: string;
	private description?: string;
	private status?: string;

	private relations: ({
		label: string;
		id: number;
		path?: string;
	} & Record<string, string | number>)[] = [];

	build(): IPage {
		const page: IPage = {
			file: {
				path: this.file.path,
				name: this.file.name,
				ext: this.file.ext,
			},
			type: this.type,
			name: this.name,
			description: this.description,
			status: this.status,
		};
		for (const relation of this.relations) {
			if ('path' in relation) {
				page[`${relation.label}_${relation.id}`] = { path: relation.path };
			}
			for (const key in relation) {
				if (['label', 'id', 'path'].includes(key)) continue;
				page[`${relation.label}_${relation.id}_${key}`] = relation[key];
			}
		}
		return page;
	}

	setFilepath(path: string): PageBuilder {
		this.file.path = path;
		return this;
	}

	setFileExtension(ext: string): PageBuilder {
		this.file.ext = ext;
		return this;
	}

	setFilename(name: string): PageBuilder {
		this.file.name = name;
		return this;
	}

	setType(type: string): PageBuilder {
		this.type = type;
		return this;
	}

	setName(name: string): PageBuilder {
		this.name = name;
		return this;
	}

	setDescription(description: string): PageBuilder {
		this.description = description;
		return this;
	}

	setStatus(status: string): PageBuilder {
		this.status = status;
		return this;
	}

	addRelationLink(label: string, i: number, path: string): PageBuilder {
		this.relations.push({
			label: label,
			id: i,
			path: path,
		});
		return this;
	}

	setRelationLink(label: string, i: number, path: string): PageBuilder {
		const rel = this.relations.find(relation =>
			relation.id === i && relation.label === label
		);
		if (rel) {
			rel.path = path;
			return this;
		}
		else {
			return this.addRelationLink(label, i, path);
		}
	}

	addRelationAttributes(label: string, i: number, attributes: Record<string, string | number>): PageBuilder {
		const rel = this.relations.find(relation =>
			relation.id === i && relation.label === label
		);
		if (rel) {
			for (const [key, value] of Object.entries(attributes)) {
				rel[key] = value;
			}
		}
		else {
			const rel = Object.assign({label: label, id: i}, attributes);
			this.relations.push(rel);
		}
		return this;
	}

	static createFullyPopulatedPage(): IPage {
		return {
			file: {
				path: "Path/to/note.md",
				name: "note",
				ext: ".md",
			},
			character_1: { path: "Related Character" },
			character_1_type: "type of the relation",
			character_1_influence: 7,
			character_1_frequency: 4,
			character_1_origin: "origin of the relation",
			character_1_affinity: 7,
			character_1_trust: -2,
			character_1_role: "role in the relation",
			character_1_impact: 6,
			character_1_consequence: "consequence of the relation",
		};
	}
}
