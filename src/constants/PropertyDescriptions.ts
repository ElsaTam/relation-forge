export class PropertyDescriptions {
    static character = {
        description: "A brief summary of who the character is",
        status: "Current state of the character (alive/dead)",
    };

    static event = {
        description: "Brief summary of what happened",
        eventImportance: "Impact of the event in the world (default from 0 to 10)",
        startDate: "When the event began",
        endDate: "When the event concluded",
    };

    static faction = {
        description: "Brief summary of the organization",
        power: "The faction's influence and resources (default from 0 to 10)",
    };

    static place = {
        description: "Brief summary of the location",
        placeImportance: "The location's significance (default from 0 to 10)",
    };

    static relation = {
        affinity: "How much entities like or dislike each other (default from -10 to 10)",
        frequency: "How often entities interact (default from 0 to 10)",
        impact: "How impactful an entity (often an event) has been on an entity (default from -10 to 10)",
        influence: "Amount of power one entity has over another (default from -10 to 10)",
        trust: "Level of trust or suspicion between entities (default from -10 to 10)",
        consequence: "The consequences of the relation on the entity",
        origin: "How the relationship began",
        role: "Entity's position or function regarding another",
        type: "Nature of the relationship (friend, rival, family, etc.)",
    };

    static get propertyMap(): PropertyMap {
        return Object.fromEntries(Object.getOwnPropertyNames(PropertyDescriptions)
            .filter(key => !["name", "length", "prototype", "propertyMap"].includes(key))
            .map(key => {
                return ((element: ElementType) => {
                    const list: Record<string, string> = {};
                    for (const key in PropertyDescriptions[element]) {
                        list[key] = key;
                    }
                    return [key, list];
                })(key as ElementType);
            })) as PropertyMap;
    }
}

export type ElementType = keyof Omit<typeof PropertyDescriptions, 'prototype' | 'propertyMap'>;
export type EntityType = keyof Omit<typeof PropertyDescriptions, 'prototype' | 'propertyMap' | 'relations'>;
export type PropertyTypes<T extends ElementType> = keyof typeof PropertyDescriptions[T];
export type PropertyMap = { [key in ElementType]: Record<PropertyTypes<key>, string> };