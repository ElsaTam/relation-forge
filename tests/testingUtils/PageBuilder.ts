import type { IPage } from '../../src/core/DataviewAdapter';

export class PageBuilder {
	private file: Record<string, string> = {
		path: "",
		name: "",
	};

	build(): IPage {
		return {
			file: {
				path: this.file.path,
				name: this.file.name,
			},
		};
	}

	path(pathName: string): PageBuilder {
		this.file.path = pathName;
		return this;
	}

	name(nameName: string): PageBuilder {
		this.file.name = nameName;
		return this;
	}

	static createFullyPopulatedPage(): IPage {
		return {
			file: {
				path: "Path/to/source.md",
				name: "",
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
