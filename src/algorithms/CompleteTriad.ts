import type { Forge } from "src/core/Forge";
import {
    assignDefined,
    BalanceTheory,
    type Graph,
    type IAlgorithm,
    type ICompleteTriadOptions,
    type ICompleteTriadQuery,
    type ITriadCompletionRecommendation,
    type RelationForgeSettings,
    Relation,
    Character,
    type IRelation,
    newRange,
} from "src/internal";

export class CompleteTriad implements IAlgorithm {
    private graph: Graph;
    private settings: RelationForgeSettings;

    constructor(forge: Forge) {
        this.graph = forge.graph;
        this.settings = forge.settings;
    }


    /**
     * Finds characters that would complete a triad in a balanced way
     * @param sourceCharacter The first character in the relationship
     * @param targetCharacter The second character in the relationship
     * @param options Configuration options
     * @returns Array of recommendations for completing triads
     */
    public async exec(query: ICompleteTriadQuery): Promise<ITriadCompletionRecommendation[]> {
        // Set default options
        const opts: ICompleteTriadOptions = assignDefined({
            minRelationshipStrength: 3,
            considerFactions: true,
            preferPositiveRelationships: true,
            allowBidirectional: false,
        }, query.options);

        let recommendations: ITriadCompletionRecommendation[] = [];

        // Get the characters
        const character1 = this.graph.getCharacter(query.source);
        const character2 = this.graph.getCharacter(query.target);
        if (!character1 || !character2) return [];
        const otherCharacters = this.graph.getCharacters().filter(
            c => c.id !== query.source && c.id !== query.target
        );

        // Get the relationship between source and target
        const relationBetween1And2 = character1.relations.find(rel => rel.target === character2.id)
            ?? character2.relations.find(rel => rel.target === character1.id);
        if (!relationBetween1And2) {
            return recommendations; // No relationship exists between these characters
        }

        const sourceTargetSign = (relationBetween1And2.affinity?.value ?? 0) > 0 ? 1 : -1;

        for (const thirdCharacter of otherCharacters) {
            // Get relationships with the third character
            const possibleRelationships: { source: Character, target: Character, relation?: IRelation }[] = [
                {
                    source: character1,
                    target: thirdCharacter,
                    relation: character1.relations.find(rel => rel.target === thirdCharacter.id),
                },
                {
                    source: thirdCharacter,
                    target: character1,
                    relation: thirdCharacter.relations.find(rel => rel.target === character1.id),
                },
                {
                    source: character2,
                    target: thirdCharacter,
                    relation: character2.relations.find(rel => rel.target === thirdCharacter.id),
                },
                {
                    source: thirdCharacter,
                    target: character2,
                    relation: thirdCharacter.relations.find(rel => rel.target === character2.id),
                },
            ];
            const existingRelationships = possibleRelationships.filter(r => !!r.relation);
            const missingRelationships = possibleRelationships.filter(r => !r.relation);

            for (const missingRel of missingRelationships) {
                if (!opts.allowBidirectional && existingRelationships.find(r => r.source === missingRel.target && r.target === missingRel.source)) {
                    continue; // Skip if a reciprocal relation already exists
                }

                // Get the existing relationship with the third character
                let existingRel: Relation | undefined;
                if (missingRel.source === character1 || missingRel.target === character1) {
                    existingRel = existingRelationships.find(r => r.source === character2 || r.target === character2)?.relation;
                }
                else if (missingRel.source === character2 || missingRel.target === character2) {
                    existingRel = existingRelationships.find(r => r.source === character1 || r.target === character1)?.relation;
                }

                if (!existingRel) {
                    continue; // Skip if no relation exists with any of the two characters
                }

                // Set the affinity to 0 if not defined by the user
                existingRel.affinity = newRange('affinity', this.settings.rangeProperties.affinity, existingRel.affinity?.value ?? 0);

                if (Math.abs(existingRel.affinity?.value ?? 0) < opts.minRelationshipStrength) {
                    continue; // Skip if existing relationship is too weak
                }

                const existingRelSign = (existingRel.affinity?.value ?? 0) > 0 ? 1 : -1;

                // Apply balance theory to determine recommended relationship
                // If source-target and existing-third have the same sign, the new one should also have that sign
                // If they have opposite signs, the new one should have the opposite sign of existing-third
                const recommendedSign = sourceTargetSign === existingRelSign ? existingRelSign : -existingRelSign;

                // Calculate a reasonable strength value based on existing relationships
                const recommendedStrength = recommendedSign * Math.min(
                    Math.abs(relationBetween1And2.affinity?.value ?? 0) * 0.8,
                    Math.abs(existingRel.affinity?.value ?? 0) * 0.8
                );

                // Calculate a balance score for this recommendation
                let balanceScore = 0.5 + (Math.min(
                    Math.abs(relationBetween1And2.affinity?.value ?? 0),
                    Math.abs(existingRel.affinity?.value ?? 0)
                ) / 20);

                // Adjust score based on preferences
                if (opts.preferPositiveRelationships && recommendedSign > 0) {
                    balanceScore += 0.1;
                }

                // If considering factions, adjust score
                if (opts.considerFactions) {
                    balanceScore = await BalanceTheory.adjustScoreForFactions(
                        this.graph,
                        balanceScore,
                        missingRel.source,
                        missingRel.target
                    );
                }

                // Add recommendation
                recommendations.push({
                    existingCharacter1: character1,
                    existingCharacter2: character2,
                    newCharacter: thirdCharacter,
                    relationBetween1And2: relationBetween1And2,
                    relationBetweenExistingAndNew: existingRel,
                    newRelation: new Relation({
                        source: missingRel.source.id,
                        target: missingRel.target.id,
                        label: 'character',
                        influence: newRange('influence', this.settings.rangeProperties.influence),
                        affinity: newRange('affinity', this.settings.rangeProperties.affinity, recommendedStrength),
                    }),
                    score: balanceScore,
                });
            }
        }

        // Sort by balance score and limit results
        if (opts.sort) {
            const sort = opts.sort;
            recommendations = recommendations.sort((a, b) => sort * (a.score - b.score));
        }
        if (opts.max && opts.max > 0) {
            recommendations = recommendations.slice(0, opts.max);
        }
        return recommendations;
    }
}
