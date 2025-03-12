import type { Character, IRelation, IRelationAttributes } from 'src/internal';

export interface ITriad {
    characters: [Character, Character, Character];
    relationships: [IRelationAttributes, IRelationAttributes, IRelationAttributes];
    isBalanced: boolean;
    score: number;  // How balanced (-1 to 1, with 1 being perfectly balanced)
    tension: number;       // How much tension exists in this triad (0-10)
}

export interface ITriadCompletionRecommendation {
    existingCharacter1: Character;
    existingCharacter2: Character;
    newCharacter: Character;
    relationBetween1And2: IRelation;
    relationBetweenExistingAndNew: IRelation;
    newRelation: IRelation;
    score: number;
}

export interface ICompleteTriadQuery {
    source: string;
    target: string;
    options: Partial<ICompleteTriadOptions>;
}
export interface ICompleteTriadOptions {
    max?: number;                          // Maximum number of recommendations to return
    sort?: -1 | 1;                          // -1: desc / +1: asc
    minRelationshipStrength: number;      // Minimum relationship strength to consider significant
    considerFactions: boolean;            // Whether to consider faction memberships
    preferPositiveRelationships: boolean; // Whether to prefer positive relationship recommendations
    allowBidirectional: boolean;          // Whether to suggest a relationship if the reciprocal exists
}

export interface IFindUnstableTriadsQuery {
    options: Partial<IFindUnstableTriadsOptions>;
}
export interface IFindUnstableTriadsOptions {
    max?: number;                  // Maximum number of triads to display
    sort?: -1 | 1;                 // -1: desc / +1: asc
    minTension: number;            // Minimum tension to include (0-10)
    onlyCompleteTriads: boolean;   // Whether to only include triads where all three relationships exist
    considerFactions: boolean;     // Whether to factor in faction relationships
    minRelationshipStrength: number; // Minimum absolute strength to consider a relationship significant
}
