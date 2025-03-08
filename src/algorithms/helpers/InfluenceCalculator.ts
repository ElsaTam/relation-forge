import { type InfluenceModelType } from "src/internal";

/**
 * Helper class for calculating total influence using different models
 */
export class InfluenceCalculator {
    /**
     * Calculate total influence influence using the specified model
     * 
     * @param influences Array of influence values along a path
     * @param model Model type to use for calculation
     * @returns The calculated total influence influence
     */
    public static calculateTotalInfluence(influences: number[], model: InfluenceModelType): number {
        if (influences.length === 0) return 0;
        if (influences.length === 1) return influences[0];

        switch (model) {
            case 'multiplicative':
                return this.multiplicativeModel(influences);
            case 'weightedAverage':
                return this.weightedAverageModel(influences);
            case 'harmonicMean':
                return this.harmonicMeanModel(influences);
            case 'weakestLink':
                return this.weakestLinkModel(influences);
            case 'networkFlow':
                return this.networkFlowModel(influences);
            case 'socialDecay':
                return this.socialDecayModel(influences);
        }
    }

    /**
     * Multiplicative model - influence diminishes with each step
     * Each intermediary reduces the original influence proportionally
     */
    private static multiplicativeModel(influences: number[]): number {
        let totalInfluence = 1;
        for (const influence of influences) {
            totalInfluence *= (influence / 10);
        }
        return totalInfluence;
    }

    /**
     * Weighted average model - closer relationships have more weight
     * Direct influence is stronger than distant influence
     */
    private static weightedAverageModel(influences: number[]): number {
        let totalInfluence = influences[0];
        for (let i = 1; i < influences.length; i++) {
            // Higher weight to closer relationships
            const weight = (influences.length - i) / influences.length;
            totalInfluence = (totalInfluence + influences[i] * weight) / (1 + weight);
        }
        return totalInfluence;
    }

    /**
     * Harmonic mean model - useful when averaging rates
     * Appropriate when influence values represent transmission rates
     */
    private static harmonicMeanModel(influences: number[]): number {
        // Handle sign separately
        const sign = influences.reduce((prod, val) => prod * Math.sign(val), 1);

        // Convert influences to positive values and add small constant to avoid division by zero
        const adjustedInfluences = influences.map(inf => Math.abs(inf) + 0.1);
        const reciprocalSum = adjustedInfluences.reduce((sum, inf) => sum + (1 / inf), 0);

        // Apply original sign to result
        const totalInfluence = sign * (adjustedInfluences.length / reciprocalSum);
        return totalInfluence;
    }

    /**
     * Weakest link model - chain is only as strong as its weakest link
     * Influence is limited by the weakest relationship in the path
     */
    private static weakestLinkModel(influences: number[]): number {
        const totalInfluence = Math.min(...influences.map(v => Math.abs(v)));

        // Maintain sign of majority influence
        const positiveCount = influences.filter(v => v > 0).length;
        const negativeCount = influences.filter(v => v < 0).length;
        const sign = positiveCount >= negativeCount ? 1 : -1;

        return sign * totalInfluence;
    }

    /**
     * Network flow model - combines weakest link with path length decay
     * Mimics flow capacity in a network with attenuation
     */
    private static networkFlowModel(influences: number[]): number {
        // Find the weakest link
        const weakestLink = Math.min(...influences.map(v => Math.abs(v)));

        // Apply distance decay
        const totalInfluence = weakestLink * Math.pow(0.9, influences.length - 1);

        // Maintain sign of majority influence
        const positiveCount = influences.filter(v => v > 0).length;
        const negativeCount = influences.filter(v => v < 0).length;
        const sign = positiveCount >= negativeCount ? 1 : -1;

        return sign * totalInfluence;
    }

    /**
     * Social distance decay model - influence decays exponentially with distance
     * Based on social network theory
     */
    private static socialDecayModel(influences: number[]): number {
        const distanceDecay = 0.5; // Decay parameter
        let totalInfluence = influences[0];

        for (let i = 1; i < influences.length; i++) {
            totalInfluence += influences[i] * Math.pow(distanceDecay, i);
        }

        return totalInfluence;
    }
}