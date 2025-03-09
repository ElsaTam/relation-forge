import { type IElement, Relation, ElementsParser, type ElementType, NumberRange, newRange, type RelationForgeSettings } from "src/internal";

export class Place implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    importance: NumberRange<'placeImportance'>;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.importance = newRange('placeImportance');
    }

    public getType(): ElementType {
        return 'place';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Place {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const place = new Place(id, name);

        if (typeof page.description === 'string') {
            place.description = page.description
        }
        if (typeof page[settings.ranges['placeImportance'].property] === 'string') {
            place.importance = newRange('placeImportance', page[settings.ranges['placeImportance'].property]);
        }

        place.relations = ElementsParser.parseRelations(page, settings);

        return place;
    }
}