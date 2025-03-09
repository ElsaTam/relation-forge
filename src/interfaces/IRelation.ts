import type { Forge } from "src/core/Forge";
import { NumberRange, type RelationType } from "src/internal";

export interface IRelation {
    source: string;
    target: string;
    label: RelationType;

    influence: NumberRange<'influence'>;    // the influence of `source` over `target`

    type?: string;
    affinity?: NumberRange<'affinity'>;     // the affinity of the relationship
    frequency?: NumberRange<'frequency'>;   // how often a character visits a place
    origin?: string;              // the origin of the relationship
    trust?: NumberRange<'trust'>;           // the trust of the relationship

    role?: string;                // the role of the character in an event or faction
    impact?: NumberRange<'impact'>;         // how impactful an event has been on a character
    consequence?: string;         // what is the consequence of the event on the character

    create: (forge: Forge) => Promise<void>;
}
