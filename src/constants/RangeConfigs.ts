export const DEFAULT_RANGES = {
    // Relations
    'affinity': { min: -10, max: 10, default: 0 },
    'frequency': { min: 0, max: 10, default: 0 },
    'impact': { min: -10, max: 10, default: 0 },
    'influence': { min: -10, max: 10, default: 0 },
    'trust': { min: -10, max: 10, default: 0 },

    // Places and Events
    'placeImportance': { min: 0, max: 10, default: 0 },
    'eventImportance': { min: 0, max: 10, default: 0 },

    // Factions
    'power': { min: 0, max: 10, default: 0 },
};

export type RelationAttribute = keyof typeof DEFAULT_RANGES;


// Define a configuration interface that users can provide
export interface RangeConfiguration {
    min: number;
    max: number;
    default: number;
}

// Maintain a registry of range configurations
export class RangeRegistry {
    private static configurations: Record<RelationAttribute, RangeConfiguration> = DEFAULT_RANGES;

    // Register a new range type
    static register(type: RelationAttribute, config: RangeConfiguration): void {
        this.configurations[type] = {
            min: config.min,
            max: config.max,
            default: config.default,
        };
    }

    // Get a configuration
    static getConfig(type: RelationAttribute): RangeConfiguration | undefined {
        return this.configurations[type];
    }

    // Check if a type is registered
    static hasType(type: string): boolean {
        return type in this.configurations;
    }
}