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
    private static configurations: Record<RelationAttribute, RangeConfiguration> = structuredClone(DEFAULT_RANGES);

    // Register a new range type
    static register(type: RelationAttribute, config: RangeConfiguration): void {
		if (!this.canRegister(config)) {
			throw new Error(`Config with min = ${config.min}, max = ${config.max} and default = ${config.default} is not valid`);
		}
		this.configurations[type] = {
            min: config.min,
            max: config.max,
            default: config.default,
        };
    }

	static registerAttribute(type: RelationAttribute, attr: keyof RangeConfiguration, value: number): void {
		if (!this.hasType(type)) {
			throw new Error(`Unknown range type: ${type}. Please register it first.`);
		}
		const config = structuredClone(this.configurations[type]);
		config[attr] = value;
		if (!this.canRegister(config)) {
			throw new Error(`Config with min = ${config.min}, max = ${config.max} and default = ${config.default} is not valid`);
		}
		this.configurations[type][attr] = value;
	}

    // Get a configuration
    static getConfig(type: RelationAttribute): RangeConfiguration | undefined {
        return this.configurations[type];
    }

    // Check if a type is registered
    static hasType(type: string): boolean {
        return type in this.configurations;
    }

	static canRegister(config: RangeConfiguration): boolean {
		return config.min <= config.max && config.default >= config.min && config.default <= config.max;
	}
}
