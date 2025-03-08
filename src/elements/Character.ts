import { type IElement, Relation, ElementsParser, type StatusType, type ElementType, type RelationForgeSettings } from "src/internal";

export class Character implements IElement {
    id: string;
    name: string;
    relations: Relation[] = [];
    description: string = "";

    status: StatusType = "";

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public getType(): ElementType {
        return 'character';
    }

    public static fromPage(page: any, settings: RelationForgeSettings): Character {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const character = new Character(id, name);

        if (typeof page.description === 'string') {
            character.description = page.description
        }
        if (typeof page.status === 'string') {
            character.status = page.status
        }

        character.relations = ElementsParser.parseRelations(page, settings);

        return character;
    }
}