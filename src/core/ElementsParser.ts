import { App, getLinkpath } from "obsidian";
import {
    Character,
    DataviewAdapter,
    type ElementType,
    Event,
    Faction,
    type IElement,
    Relation,
    Place,
    RELATION_TYPES,
    type RelationType,
    newRange,
    type RelationForgeSettings
} from "src/internal";

// Parse Dataview page into structured data
export class ElementsParser {
    // Returns the path
    public static parseLink(app: App, mdLink: string): string | undefined {
        const match = new RegExp(/\[\[(.*?)\]\]/g).exec(mdLink);
        if (match) {
            return app.metadataCache.getFirstLinkpathDest(getLinkpath(match[1]), '.')?.path ?? undefined;
        }
        return;
    }

    public static parseRelations(page: any, settings: RelationForgeSettings, types: RelationType[] = RELATION_TYPES): Relation[] {
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
                    type: DataviewAdapter.getStringProperty(page, `${label}_${index}_type`),
                    influence: newRange('influence', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.ranges['influence'].property}`)),
                    frequency: newRange('frequency', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.ranges['frequency'].property}`)),
                    origin: DataviewAdapter.getStringProperty(page, `${label}_${index}_origin`),
                    affinity: newRange('affinity', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.ranges['affinity'].property}`)),
                    trust: newRange('trust', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.ranges['trust'].property}`)),
                    role: DataviewAdapter.getStringProperty(page, `${label}_${index}_role`),
                    impact: newRange('impact', DataviewAdapter.getNumberProperty(page, `${label}_${index}_${settings.ranges['impact'].property}`)),
                    consequence: DataviewAdapter.getStringProperty(page, `${label}_${index}_consequence`),
                });

                relations.push(relation);
            }
        }

        return relations;
    }

    // Generic parse method
    public static parseFromPath(app: App, path: string, settings: RelationForgeSettings): IElement | undefined {
        const page = new DataviewAdapter(app).page(path);
        if (!page) return;
        return ElementsParser.parse(page, settings);
    }

    public static parse(page: Record<string, any>, settings: RelationForgeSettings, type?: ElementType): IElement | undefined {
        type = type ?? ElementsParser.findType(page);
        switch (type) {
            case 'character':
                return Character.fromPage(page, settings);

            case 'event':
                return Event.fromPage(page, settings);

            case 'faction':
                return Faction.fromPage(page, settings);

            case 'place':
                return Place.fromPage(page, settings);
        }
        return;
    }

    private static findType(page: Record<string, any>): ElementType | undefined {
        const type = page.type;
        switch (type) {
            case 'character':
            case 'event':
            case 'faction':
            case 'place':
                return type;
        }
        return;
    }
}

export function parseBool(str: string): boolean | undefined {
    if (str.toLowerCase() === "true") {
        return true;
    }
    if (str.toLowerCase() === "false") {
        return false;
    }
    return undefined;
}