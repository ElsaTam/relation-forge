import type { App } from "obsidian";
import {
    ElementsParser,
    NumberRange,
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

    async create(app: App, settings: RelationForgeSettings): Promise<void> {
        const file = app.vault.getFileByPath(this.source);
        if (!file) throw new Error(`File ${this.source} does not exists`);

        return app.fileManager.processFrontMatter(file, (frontmatter: any) => {
            let i = 1;
            while (true) {
                if (Object.keys(frontmatter).find(key => key.startsWith(`${this.label}_${i}_`) || key === `${this.label}_${i}`)) {
                    let target = frontmatter[`${this.label}_${i}`];
                    if (target) {
                        target = ElementsParser.parseLink(app, target);
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

            const targetFile = app.vault.getFileByPath(this.target);
            frontmatter[`${this.label}_${i}`] = targetFile ? app.fileManager.generateMarkdownLink(targetFile, file.path) : `[[${this.target}]]`
            frontmatter[`${this.label}_${i}_${settings.ranges['influence'].property}`] = this.influence;
            if (this.affinity) frontmatter[`${this.label}_${i}_${settings.ranges['affinity'].property}`] = this.affinity;
            if (this.consequence) frontmatter[`${this.label}_${i}_consequence`] = this.consequence;
            if (this.frequency) frontmatter[`${this.label}_${i}_${settings.ranges['frequency'].property}`] = this.frequency;
            if (this.impact) frontmatter[`${this.label}_${i}_${settings.ranges['impact'].property}`] = this.impact;
            if (this.origin) frontmatter[`${this.label}_${i}_origin`] = this.origin;
            if (this.role) frontmatter[`${this.label}_${i}_role`] = this.role;
            if (this.trust) frontmatter[`${this.label}_${i}_${settings.ranges['trust'].property}`] = this.trust;
            if (this.type) frontmatter[`${this.label}_${i}_type`] = this.type;

        });
    }
}