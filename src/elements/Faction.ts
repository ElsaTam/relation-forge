import { type IElement, Relation, ElementsParser, type ElementType, NumberRange, newRange, type RelationForgeSettings } from "src/internal";

export class Faction implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    power: NumberRange<'power'>;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.power = newRange('power');
    }

    public getType(): ElementType {
        return 'faction';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Faction {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const faction = new Faction(id, name);

        if (typeof page[settings.properties.faction.description] === 'string') {
            faction.description = page[settings.properties.faction.description];
        }
        if (typeof page[settings.properties.faction.power] === 'number') {
            faction.power = newRange('power', page[settings.properties.faction.power]);
        }

        faction.relations = Relation.fromPage(page, settings);

        return faction;
    }
}