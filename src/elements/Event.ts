import {
	type IElement,
	Relation,
	type ElementType,
	NumberRange,
	newRange,
	type RelationForgeSettings,
	DEFAULT_RANGES
} from 'src/internal';

type EventProperty = 'importance';

export class Event implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    startDate: Date | null = null;
    endDate: Date | null = null;
    importance: NumberRange<'eventImportance'>;

    constructor(id: string, name: string, ranges: typeof DEFAULT_RANGES) {
        this.id = id;
        this.name = name;
        this.importance = newRange('eventImportance', ranges.eventImportance);
    }

    public getType(): ElementType {
        return 'event';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Event {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const event = new Event(id, name, settings.rangeProperties);

        if (typeof page[settings.properties.event.description] === 'string') {
            event.description = page[settings.properties.event.description];
        }
        if (page.hasOwnProperty(page[settings.properties.event.startDate])) {
            event.startDate = page[settings.properties.event.startDate];
        }
        if (page.hasOwnProperty(page[settings.properties.event.endDate])) {
            event.endDate = page[settings.properties.event.endDate];
        }
        if (typeof page[settings.properties.event.eventImportance] === 'string') {
            event.importance = newRange('eventImportance', page[settings.properties.event.eventImportance]);
        }

        event.relations = Relation.fromPage(page, settings);

        return event;
    }
}
