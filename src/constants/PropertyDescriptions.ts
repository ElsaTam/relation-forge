export class PropertyDescriptions {
    static characters = {
        description: "A brief summary of who the character is",
        status: "Current state of the character (alive/dead)",
    };

    static events = {
        description: "Brief summary of what happened",
        importance: "Impact of the event in the world (default from 0 to 10)",
        startDate: "When the event began",
        endDate: "When the event concluded",
    };

    static factions = {
        description: "Brief summary of the organization",
        power: "The faction's influence and resources (default from 0 to 10)",
    };

    static places = {
        description: "Brief summary of the location",
        importance: "The location's significance (default from 0 to 10)",
    };

    static relations = {
        affinity: "How much entities like or dislike each other (default from -10 to 10)",
        frequency: "How often entities interact (default from 0 to 10)",
        impact: "How impactful an entity (often an event) has been on an entity (default from -10 to 10)",
        influence: "Amount of power one entity has over another (default from -10 to 10)",
        trust: "Level of trust or suspicion between entities (default from -10 to 10)",
        type: "Nature of the relationship (friend, rival, family, etc.)",
        origin: "How the relationship began",
        role: "Entity's position or function regarding another",
    };
}