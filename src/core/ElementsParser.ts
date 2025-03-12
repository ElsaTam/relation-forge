import { App, getLinkpath } from "obsidian";
import {
    Character,
    DataviewAdapter,
    type ElementType,
    Event,
    Faction,
    type IElement,
    Place,
    type RelationForgeSettings,
    type IPage
} from "src/internal";
import type { Forge } from "./Forge";

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

    // Generic parse method
    public static parseFromPath(forge: Forge, path: string): IElement | undefined {
        const page = new DataviewAdapter(forge.app).page(path);
        if (!page) return;
        return ElementsParser.parse(page, forge.settings);
    }

    public static parse(page: IPage, settings: RelationForgeSettings, type?: ElementType): IElement | undefined {
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