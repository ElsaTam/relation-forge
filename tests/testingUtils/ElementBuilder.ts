import type { IRelation } from '../../src/interfaces/IRelation';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import type { IElement } from '../../src/interfaces/IElement';

export class ElementBuilder {
	private id: string = "";
	private name: string = "";
	private relations: IRelation[] = [];
	private description: string = "";
	private type: ElementType = "character";

	build(): IElement {
		return {
			id: this.id,
			name: this.name,
			relations: this.relations,
			description: this.description,
			getType: (): ElementType => this.type,
		};
	}

	setID(id: string): ElementBuilder {
		this.id = id;
		return this;
	}

	setName(name: string): ElementBuilder {
		this.name = name;
		return this;
	}

	setRelations(relations: IRelation[]): ElementBuilder {
		this.relations = relations;
		return this;
	}

	addRelation(relation: IRelation): ElementBuilder {
		this.relations.push(relation);
		return this;
	}

	setDescription(description: string): ElementBuilder {
		this.description = description;
		return this;
	}

	setType(type: ElementType): ElementBuilder {
		this.type = type;
		return this;
	}
}
