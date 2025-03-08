import type { Character, Graph, IRelation } from "src/internal";

export class BalanceTheory {

    /**
     * Calculates tension in an unbalanced triad
     */
    public static calculateTriadTension(rel12: IRelation, rel23: IRelation, rel31: IRelation): number {
        // Tension is higher when:
        // 1. Relationship strengths are high (strong feelings)
        // 2. The triad is severely unbalanced

        // Calculate average relationship strength
        const avgStrength = (Math.abs(rel12.influence.value) + Math.abs(rel23.influence.value) + Math.abs(rel31.influence.value)) / 3;

        // Count negative relationships
        const negativeCount = [rel12.influence, rel23.influence, rel31.influence].filter(influence => influence.value < 0).length;

        // Maximum tension when all three are negative, or just one is negative
        const isMaximallyUnbalanced = negativeCount === 3 || negativeCount === 1;

        // Calculate tension (0-10 scale)
        return isMaximallyUnbalanced
            ? Math.min(10, avgStrength * 2)
            : Math.min(8, avgStrength * 1.5);
    }

    /**
     * Calculates tension in a partially formed triad
     */
    public static calculatePartialTriadTension(relationships: (IRelation | undefined)[]): number {
        // For incomplete triads, tension is based on the conflicting relationship signals
        const relationshipSigns = relationships.map(r => r === undefined ? 0 : r.influence.value > 0 ? 1 : -1);
        const sameSign = relationshipSigns[0] === relationshipSigns[1];

        // If they have the same sign, there's no inherent tension yet
        if (sameSign) return 0;

        // Calculate average relationship strength
        const avgStrength = relationships.reduce((sum, r) => sum + Math.abs(r === undefined ? 0 : r.influence.value), 0) / relationships.length;

        // Calculate tension (0-10 scale, but lower for incomplete triads)
        return Math.min(7, avgStrength * 1.2);
    }

    /**
     * Adjusts tension based on character factions
     */
    public static async adjustTensionForFactions(graph: Graph, tension: number, char1: Character, char2: Character, char3: Character): Promise<number> {
        const factions1 = await graph.getFactionsForCharacter(char1);
        const factions2 = await graph.getFactionsForCharacter(char2);
        const factions3 = await graph.getFactionsForCharacter(char3);

        if (!factions1.length || !factions2.length || !factions3.length) {
            return tension; // If any character lacks faction data, return original tension
        }

        // Calculate faction overlaps
        const sharedFactions12 = factions1.filter(f => factions2.includes(f));
        const sharedFactions23 = factions2.filter(f => factions3.includes(f));
        const sharedFactions13 = factions1.filter(f => factions3.includes(f));

        // Count how many characters share at least one faction
        let sharedFactionPairs = 0;
        if (sharedFactions12.length > 0) sharedFactionPairs++;
        if (sharedFactions23.length > 0) sharedFactionPairs++;
        if (sharedFactions13.length > 0) sharedFactionPairs++;

        // Find factions shared by all three characters
        const factionSharedByAll = factions1.filter(f => factions2.includes(f) && factions3.includes(f));

        // Adjust tension based on faction dynamics
        if (factionSharedByAll.length > 0) {
            // If all share at least one faction, reduce tension
            return tension * (0.9 - (factionSharedByAll.length * 0.05));
        } else if (sharedFactionPairs === 0) {
            // If no two characters share any faction, increase tension
            return tension * 1.2;
        } else if (sharedFactionPairs === 1) {
            // If only one pair shares a faction, slightly increase tension
            return tension * 1.1;
        } else if (sharedFactionPairs === 2) {
            // If two pairs share factions, slight decrease in tension
            return tension * 0.95;
        } else {
            // Complex mix of shared factions
            return tension * 1.0;
        }
    }

    /**
   * Adjusts recommendation score based on factions
   */
    public static async adjustScoreForFactions(graph: Graph, score: number, char1: Character, char2: Character): Promise<number> {
        try {
            // Get factions for both characters
            const factions1 = await graph.getFactionsForCharacter(char1);
            const factions2 = await graph.getFactionsForCharacter(char2);

            if (!factions1.length || !factions2.length) {
                return score; // If faction data is missing, return original score
            }

            // Find shared factions
            const sharedFactions = factions1.filter(f => factions2.includes(f));

            // Adjust score based on faction overlap
            if (sharedFactions.length > 0) {
                // Boost score for characters in the same faction(s)
                // The more shared factions, the higher the boost
                return score * (1.0 + (sharedFactions.length * 0.08));
            } else {
                // Calculate faction "distance"
                // Characters with more faction affiliations are more likely to have 
                // competing interests even if they don't directly oppose each other
                const factionDistance = Math.min(factions1.length, factions2.length) * 0.05;
                return score * (0.95 - factionDistance);
            }
        } catch (error) {
            // If error occurs, return original score
            return score;
        }
    }
}