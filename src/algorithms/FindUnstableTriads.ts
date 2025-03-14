import type { Forge } from "src/core/Forge";
import {
    assignDefined,
    BalanceTheory,
    newRange,
    type Graph,
    type IAlgorithm,
    type IFindUnstableTriadsOptions,
    type IFindUnstableTriadsQuery,
    type ITriad,
    type RelationForgeSettings
} from "src/internal";

export class FindUnstableTriads implements IAlgorithm {
    private graph: Graph;
    private settings: RelationForgeSettings;

    constructor(forge: Forge) {
        this.graph = forge.graph;
        this.settings = forge.settings;
    }


    /**
     * Finds all unstable triads in the character network
     * @param options Configuration options
     * @returns Array of unstable triads with details about their imbalance
     */
    public async exec(query: IFindUnstableTriadsQuery): Promise<ITriad[]> {
        // Set default options
        const opts: IFindUnstableTriadsOptions = assignDefined({
            minTension: 3,
            onlyCompleteTriads: false,
            considerFactions: true,
            minRelationshipStrength: 2,
        }, query.options);

        let unstableTriads: ITriad[] = [];
        const characters = await this.graph.getCharacters();

        // Loop through all possible triads of characters
        for (let i = 0; i < characters.length; i++) {
            for (let j = i + 1; j < characters.length; j++) {
                for (let k = j + 1; k < characters.length; k++) {
                    const char1 = characters[i];
                    const char2 = characters[j];
                    const char3 = characters[k];

                    // Get relationships between these characters
                    const rel12 = char1.relations.find(rel => rel.target === char2.id);
                    const rel23 = char2.relations.find(rel => rel.target === char3.id);
                    const rel31 = char3.relations.find(rel => rel.target === char1.id);

                    // Skip if we want only complete triads and this one isn't complete
                    if (opts.onlyCompleteTriads && (!rel12 || !rel23 || !rel31)) {
                        continue;
                    }

                    // Calculate relationship signs (positive/negative)
                    const sign12 = rel12 ? (rel12.influence.value > 0 ? 1 : -1) : 0;
                    const sign23 = rel23 ? (rel23.influence.value > 0 ? 1 : -1) : 0;
                    const sign31 = rel31 ? (rel31.influence.value > 0 ? 1 : -1) : 0;

                    // Skip triads with relationships below threshold
                    if (rel12 && Math.abs(rel12.influence.value) < opts.minRelationshipStrength) continue;
                    if (rel23 && Math.abs(rel23.influence.value) < opts.minRelationshipStrength) continue;
                    if (rel31 && Math.abs(rel31.influence.value) < opts.minRelationshipStrength) continue;

                    // Apply balance theory:
                    // A triad is balanced if the product of the signs is positive
                    // That means either all three relationships are positive,
                    // or exactly one relationship is positive (and two are negative)
                    const relationshipProduct = sign12 * sign23 * sign31;

                    // If some relationships don't exist, we calculate partial balance
                    const existingRelationships = [sign12, sign23, sign31].filter(s => s !== 0);
                    const existingProduct = existingRelationships.reduce((prod, sign) => prod * sign, 1);

                    // Calculate balance score and tension
                    let isBalanced = true;
                    let balanceScore = 1.0;
                    let tension = 0;

                    if (rel12 && rel23 && rel31) {
                        // Complete triad
                        isBalanced = relationshipProduct > 0;
                        balanceScore = isBalanced ? 1.0 : -1.0;
                        tension = isBalanced ? 0 : BalanceTheory.calculateTriadTension(rel12, rel23, rel31);
                    } else if (existingRelationships.length === 2) {
                        // Incomplete triad with 2 relationships
                        isBalanced = existingProduct < 0; // Two relationships should have opposite signs
                        balanceScore = isBalanced ? 0.5 : -0.5;
                        tension = isBalanced ? 0 : BalanceTheory.calculatePartialTriadTension(
                            [rel12, rel23, rel31].filter(r => r)
                        );
                    } else if (existingRelationships.length === 1) {
                        // Only one relationship exists - consider marginally balanced
                        isBalanced = true;
                        balanceScore = 0.1;
                        tension = 0;
                    } else {
                        // No relationships exist
                        continue;
                    }

                    // If we're considering factions, adjust tension
                    if (opts.considerFactions) {
                        tension = await BalanceTheory.adjustTensionForFactions(this.graph, tension, char1, char2, char3);
                    }

                    // Skip if tension is below threshold
                    if (tension < opts.minTension || isBalanced) {
                        continue;
                    }

                    // Get relationship types
                    const type12 = rel12?.type ?? '';
                    const type23 = rel23?.type ?? '';
                    const type31 = rel31?.type ?? '';

                    // Add to unstable triads list
                    unstableTriads.push({
                        characters: [char1, char2, char3],
                        relationships: [
                            { source: char1.id, target: char2.id, influence: newRange('influence' ,this.settings.rangeProperties.influence, rel12?.influence), label: 'character', type: type12 },
                            { source: char2.id, target: char3.id, influence: newRange('influence' ,this.settings.rangeProperties.influence, rel23?.influence), label: 'character', type: type23 },
                            { source: char3.id, target: char1.id, influence: newRange('influence' ,this.settings.rangeProperties.influence, rel31?.influence), label: 'character', type: type31 }
                        ],
                        isBalanced,
                        score: balanceScore,
                        tension
                    });
                }
            }
        }

        // Sort by tension and limit results
        if (opts.sort) {
            const sort = opts.sort;
            unstableTriads = unstableTriads.sort((a, b) => sort * (a.tension - b.tension));
        }
        if (opts.max && opts.max > 0) {
            unstableTriads = unstableTriads.slice(0, opts.max);
        }
        return unstableTriads;
    }
}
