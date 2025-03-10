import type { Forge } from "src/core/Forge";
import {
    DataviewAdapter,
    ElementsParser,
    newRange,
    NumberRange,
    RELATION_TYPES,
    type IRelation,
    type RelationForgeSettings,
    type RelationType,
} from "src/internal";

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


    constructor(props: Omit<IRelation, 'create'>) {
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

        let reg = '^(';
        for (let i = 0, n = types.length; i < n; ++i) {
            reg += types[i];
            if (i < types.length - 1) reg += '|';
        }
        reg += ')_\\d+$';
        const relationRegex = new RegExp(reg);

        for (const key in page) {
            if (relationRegex.test(key)) {
                if (!page[key].hasOwnProperty('path')) continue;

                const target: string = page[key].path;
                const index = new RegExp('\\d+$').exec(key);

                let label: RelationType | undefined;
                for (const type of types) {
                    if (key.startsWith(type)) {
                        label = type;
                        break;
                    }
                }

                if (!label) continue;

                let relation: Relation = new Relation({
                    source: page.file.path,
                    target: target,
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

    async create(forge: Forge): Promise<void> {
        const file = forge.app.vault.getFileByPath(this.source);
        if (!file) throw new Error(`File ${this.source} does not exists`);

        return forge.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
            let i = 1;
            while (true) {
                if (Object.keys(frontmatter).find(key => key.startsWith(`${this.label}_${i}_`) || key === `${this.label}_${i}`)) {
                    let target = frontmatter[`${this.label}_${i}`];
                    if (target) {
                        target = ElementsParser.parseLink(forge.app, target);
                        if (target === this.target) {
                            break; // The relation already exists, at index i
                        }
                    }
                    i++;
                }
                else {
                    break;
                }
            }

            const targetFile = forge.app.vault.getFileByPath(this.target);
            frontmatter[`${this.label}_${i}`] = targetFile ? forge.app.fileManager.generateMarkdownLink(targetFile, file.path) : `[[${this.target}]]`
            frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.influence}`] = this.influence;
            if (this.affinity) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.affinity}`] = this.affinity;
            if (this.consequence) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.consequence}`] = this.consequence;
            if (this.frequency) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.frequency}`] = this.frequency;
            if (this.impact) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.impact}`] = this.impact;
            if (this.origin) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.origin}`] = this.origin;
            if (this.role) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.role}`] = this.role;
            if (this.trust) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.trust}`] = this.trust;
            if (this.type) frontmatter[`${this.label}_${i}_${forge.settings.properties.relation.type}`] = this.type;

        });
    }
}