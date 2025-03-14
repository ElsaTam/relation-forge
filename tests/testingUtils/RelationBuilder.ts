import type { Relation } from '../../src/elements/Relation';
import type { RelationType } from '../../src/types/RelationType';
import { newRange, NumberRange } from '../../src/core/NumberRange';
import  { type Forge } from '../../src/core/Forge';
import type { TFile } from 'obsidian';
import { DEFAULT_RANGES } from '../../src/constants/RangeConfigs';

export class RelationBuilder {
	private source: string = '';
	private target: string = '';
	private label: RelationType = 'character';
	private influence: NumberRange<'influence'> = newRange('influence');
	private affinity?: NumberRange<'affinity'>;
	private frequency?: NumberRange<'frequency'>;
	private impact?: NumberRange<'impact'>;
	private trust?: NumberRange<'trust'>;
	private type?: string;
	private consequence?: string;
	private role?: string;
	private origin?: string;

	build(): Relation {
		return {
			source: this.source,
			target: this.target,
			label: this.label,
			influence: this.influence,
			create: (_: Forge): Promise<void> => {
				return new Promise<void>(() => {});
			},
			saveInFrontMatter(_1: any, _2: Forge, _3: TFile): void {},
			type: this.type,
			consequence: this.consequence,
			role: this.role,
			origin: this.origin,
			affinity: this.affinity,
			frequency: this.frequency,
			impact: this.impact,
			trust: this.trust,
		};
	}

	setSource(source: string): RelationBuilder {
		this.source = source;
		return this;
	}

	setTarget(target: string): RelationBuilder {
		this.target = target;
		return this;
	}

	setLabel(label: RelationType): RelationBuilder {
		this.label = label;
		return this;
	}

	setInfluence(influence: NumberRange<'influence'>): RelationBuilder {
		this.influence = influence;
		return this;
	}

	setAffinity(affinity: NumberRange<'affinity'>): RelationBuilder {
		this.affinity = affinity;
		return this;
	}

	setFrequency(frequency: NumberRange<'frequency'>): RelationBuilder {
		this.frequency = frequency;
		return this;
	}

	setImpact(impact: NumberRange<'impact'>): RelationBuilder {
		this.impact = impact;
		return this;
	}

	setTrust(trust: NumberRange<'trust'>): RelationBuilder {
		this.trust = trust;
		return this;
	}
}
