import {
	type IElement,
	Relation,
	type ElementType,
	NumberRange,
	newRange,
	type RelationForgeSettings,
	DEFAULT_RANGES
} from 'src/internal';

export class Faction implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    power: NumberRange<'power'>;

    constructor(id: string, name: string, ranges: typeof DEFAULT_RANGES) {
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

        const faction = new Faction(id, name, settings.rangeProperties);

        if (typeof page[settings.properties.faction.description] === 'string') {
            faction.description = page[settings.properties.faction.description];
        }
        if (typeof page[settings.properties.faction.power] === 'number') {
			faction.power = newRange('power');
		}

        faction.relations = Relation.fromPage(page, settings);

        return faction;
    }
}
