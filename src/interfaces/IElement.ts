import { type ElementType, type IRelation } from "src/internal";

export interface IElement {
    id: string;
    name: string;
    relations: IRelation[];
    description: string;

    getType: () => ElementType;
}