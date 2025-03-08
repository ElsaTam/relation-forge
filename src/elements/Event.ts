import { type IElement, Relation, ElementsParser, type ElementType, NumberRange, newRange, type RelationForgeSettings } from "src/internal";

type EventProperty = 'importance';

export class Event implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    startDate: Date | null = null;
    endDate: Date | null = null;
    importance: NumberRange<'importance'>;

    constructor(id: string, name: string,) {
        this.id = id;
        this.name = name;
        this.importance = newRange('importance');
    }

    public getType(): ElementType {
        return 'event';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Event {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const event = new Event(id, name);

        if (typeof page.description === 'string') {
            event.description = page.description
        }
        if (page.hasOwnProperty('startDate')) {
            event.startDate = page.startDate
        }
        if (page.hasOwnProperty('endDate')) {
            event.endDate = page.endDate
        }
        if (typeof page[settings.ranges['importance'].property] === 'string') {
            event.importance = newRange('importance', page[settings.ranges['importance'].property]);
        }

        event.relations = ElementsParser.parseRelations(page, settings);

        return event;
    }
}