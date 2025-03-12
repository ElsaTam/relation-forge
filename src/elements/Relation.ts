import type { Forge } from 'src/core/Forge';
import {
	DataviewAdapter,
	ElementsParser,
	type IRelation,
	type IRelationAttributes,
	newRange,
	NumberRange,
	RELATION_TYPES,
	type RelationForgeSettings,
	type RelationType
} from 'src/internal';
import type { TFile } from 'obsidian';

export class Relation implements IRelation {
	source: string;
	target: string;
	label: RelationType;

	influence: NumberRange<'influence'>;

	affinity?: NumberRange<'affinity'>;
	consequence?: string;
	frequency?: NumberRange<'frequency'>;
	impact?: NumberRange<'impact'>;
	origin?: string;
	role?: string;
	trust?: NumberRange<'trust'>;
	type?: string;

	constructor(props: IRelationAttributes) {
		this.source = props.source;
		this.target = props.target;
		this.label = props.label;
		this.influence = props.influence;

		this.affinity = props.affinity;
		this.consequence = props.consequence;
		this.frequency = props.frequency;
		this.impact = props.impact;
		this.origin = props.origin;
		this.role = props.role;
		this.trust = props.trust;
		this.type = props.type;
	}

	public static fromPage(page: any, settings: RelationForgeSettings, types: RelationType[] = RELATION_TYPES): Relation[] {
		const relations: Relation[] = [];

		const relationRegex = new RegExp(this.getTypesRegex(types));

		for (const key in page) {
			if (relationRegex.test(key)) {
				if (!page[key].hasOwnProperty('path')) continue;

				const index = new RegExp('\\d+$').exec(key);
				const label = this.getLabel(types, key);
				if (!label) continue;

				let relation: Relation = new Relation({
					source: page.file.path,
					target: page[key].path,
					label: label,
					type: DataviewAdapter.getStringProperty(page, `${label}_${index}_${settings.properties.relation.type}`),
					influence: newRange('influence', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.properties.relation.influence}`)),
					frequency: newRange('frequency', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.properties.relation.frequency}`)),
					origin: DataviewAdapter.getStringProperty(page, `${label}_${index}_${settings.properties.relation.origin}`),
					affinity: newRange('affinity', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.properties.relation.affinity}`)),
					trust: newRange('trust', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.properties.relation.trust}`)),
					role: DataviewAdapter.getStringProperty(page, `${label}_${index}_${settings.properties.relation.role}`),
					impact: newRange('impact', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.properties.relation.impact}`)),
					consequence: DataviewAdapter.getStringProperty(page, `${label}_${index}_${settings.properties.relation.consequence}`),
				});

				relations.push(relation);
			}
		}

		return relations;
	}

	static getTypesRegex(types: RelationType[]): string {
		let reg = '^(';
		for (let i = 0, n = types.length; i < n; ++i) {
			reg += types[i];
			if (i < types.length - 1) reg += '|';
		}
		reg += ')_\\d+$';
		return reg;
	}

	static getLabel(types: RelationType[], key: string): RelationType | undefined {
		let label: RelationType | undefined;
		for (const type of types) {
			if (key.startsWith(type)) {
				label = type;
				break;
			}
		}
		return label;
	}

	async create(forge: Forge): Promise<void> {
		const file = forge.app.vault.getFileByPath(this.source);
		if (!file) throw new Error(`File ${this.source} does not exists`);

		return forge.app.fileManager.processFrontMatter(file, (frontMatter: any) => {
			this.saveInFrontMatter(frontMatter, forge, file);
		});
	}

	saveInFrontMatter(frontMatter: any, forge: Forge, file: TFile) {
		let i = 1;
		while (true) {
			if (Object.keys(frontMatter).find(key => key.startsWith(`${this.label}_${i}_`) || key === `${this.label}_${i}`)) {
				let target = frontMatter[`${this.label}_${i}`];
				if (target) {
					target = ElementsParser.parseLink(forge.app, target);
					if (target === this.target) {
						break; // The relation already exists, at index i
					}
				}
				i++;
			} else {
				break;
			}
		}

		const targetFile = forge.app.vault.getFileByPath(this.target);
		frontMatter[`${this.label}_${i}`] = targetFile ? forge.app.fileManager.generateMarkdownLink(targetFile, file.path) : `[[${this.target}]]`;
		frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.influence}`] = this.influence;
		if (this.affinity) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.affinity}`] = this.affinity;
		if (this.consequence) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.consequence}`] = this.consequence;
		if (this.frequency) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.frequency}`] = this.frequency;
		if (this.impact) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.impact}`] = this.impact;
		if (this.origin) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.origin}`] = this.origin;
		if (this.role) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.role}`] = this.role;
		if (this.trust) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.trust}`] = this.trust;
		if (this.type) frontMatter[`${this.label}_${i}_${forge.settings.properties.relation.type}`] = this.type;
	}
}
