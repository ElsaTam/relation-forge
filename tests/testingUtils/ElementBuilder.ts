import type { IRelation } from '../../src/interfaces/IRelation';
import type { ElementType } from '../../src/constants/PropertyDescriptions';
import type { IElement } from '../../src/interfaces/IElement';
import type { Character } from '../../src/elements/Character';
import type { StatusType } from '../../src/types/StatusType';
import type { Place } from '../../src/elements/Place';
import { newRange, type NumberRange } from '../../src/core/NumberRange';

export class ElementBuilder {
	private id: string = "";
	private name: string = "";
	private relations: IRelation[] = [];
	private description: string = "";
	private type: ElementType = "character";
	private placeImportance: NumberRange<'placeImportance'> = newRange("placeImportance");

	build(): IElement {
		return {
			id: this.id,
			name: this.name,
			relations: this.relations,
			description: this.description,
			getType: (): ElementType => this.type,
		};
	}

	buildCharacter(): Character {
		this.type = "character";
		const status: StatusType = "";
		return Object.assign({
			status: status,
		}, this.build());
	}

	buildPlace(): Place {
		this.type = "place";
		return Object.assign({
			importance: this.placeImportance,
		}, this.build());
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

	setPlaceImportance(placeImportance: NumberRange<'placeImportance'>): ElementBuilder {
		this.placeImportance = placeImportance;
		return this;
	}
}
