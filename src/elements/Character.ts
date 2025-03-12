import {
    type IElement,
    Relation,
    type StatusType,
    type ElementType,
    type RelationForgeSettings,
    asStatusType,
    type IPage
} from 'src/internal';

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

    public static fromPage(page: IPage, settings: RelationForgeSettings): Character {
        const id = page.file.path;
        const name = page.name ?? page.file.name;

        const character = new Character(id, name);

        if (typeof page[settings.properties.character.description] === 'string') {
            character.description = page[settings.properties.character.description];
        }
        if (typeof page[settings.properties.character.status] === 'string') {
            character.status = asStatusType(page[settings.properties.character.status]);
        }

        character.relations = Relation.fromPage(page, settings);

        return character;
    }
}
