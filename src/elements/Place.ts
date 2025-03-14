import {
	type IElement,
	Relation,
	ElementsParser,
	type ElementType,
	NumberRange,
	newRange,
	type RelationForgeSettings,
	DEFAULT_RANGES
} from 'src/internal';

export class Place implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    importance: NumberRange<'placeImportance'>;

    constructor(id: string, name: string, ranges: typeof DEFAULT_RANGES) {
        this.id = id;
        this.name = name;
        this.importance = newRange('placeImportance', ranges.placeImportance);
    }

    public getType(): ElementType {
        return 'place';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Place {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const place = new Place(id, name, settings.rangeProperties);

        if (typeof page[settings.properties.place.description] === 'string') {
            place.description = page[settings.properties.place.description];
        }
        if (typeof page[settings.properties.place.placeImportance] === 'string') {
            place.importance = newRange('placeImportance', page[settings.properties.place.placeImportance]);
        }

        place.relations = Relation.fromPage(page, settings);

        return place;
    }
}
