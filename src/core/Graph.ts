import Graphology from 'graphology';
import betweennessCentrality from 'graphology-metrics/centrality/betweenness';
import pagerank from 'graphology-metrics/centrality/pagerank';
import type { Attributes } from 'graphology-types';
import { App, Component } from 'obsidian';
import {
    Character,
    DataviewAdapter,
    Event,
    Faction,
    GraphologyBuilder,
    Place,
    type ElementType,
    type IElement,
    type IRelation,
} from 'src/internal';
import type { Forge } from './Forge';


export class Graph extends Component {
    #forge: Forge;
    #centralityScores?: any;
    #core?: Graphology;

    constructor(forge: Forge) {
        super();
        this.#forge = forge;
    }

    override onload(): void {
        this.#core = GraphologyBuilder.build(this.#forge);

        try { this.#centralityScores = betweennessCentrality(this.#core); }
        catch { this.#centralityScores = undefined; }
    }

    get core(): Graphology {
        if (!this.#core) throw new Error("Core graph not loaded.");
        return this.#core;
    }

    // ================================ EDGES =============================== //

    getRelationFromID(edgeID: string): IRelation {
        return this.core.getEdgeAttribute(edgeID, 'relation');
    }

    getRelation(source: string, target: string): IRelation {
        return this.core.getEdgeAttribute(this.core.edge(source, target), 'relation');
    }

    getOutRelations(source: string): IRelation[] {
        return this.core.mapOutEdges(source, (edge: string, attr: Attributes) => attr.relation);
    }

    hasRelation(source: string, target: string): boolean {
        return this.core.hasEdge(source, target);
    }

    // ================================ NODES =============================== //

    getNodes(): string[] {
        return this.core.nodes();
    }

    getNode(path: string): Attributes {
        return this.core.getNodeAttributes(path);
    }

    getElement(path: string): IElement {
        return this.core.getNodeAttribute(path, 'element');
    }

    getElementsPerType(type: ElementType): IElement[] {
        return this.core.filterNodes((key, attr) => {
            return attr.type === type;
        }).map(id => this.core.getNodeAttribute(id, 'element'));
    }

    getOutNeighbors(source: string): IElement[] {
        return this.core.mapOutNeighbors(source, (target: string, attr: Attributes) => attr.element);
    }

    // ============================= CHARACTERS ============================= //

    getCharacters(): Character[] {
        return this.getElementsPerType('character') as Character[];
    }

    getCharacter(path: string): Character | undefined {
        const element = this.getElement(path);
        return element?.getType() === 'character' ? element as Character : undefined;
    }

    // =============================== EVENTS =============================== //

    getEvents(): Event[] {
        return this.getElementsPerType('event') as Event[];
    }

    getEventsForCharacter(character: Character): Event[] {
        const characterEvents: Event[] = character.relations
            .reduce((acc: Event[], rel) => {
                const event = this.getEvent(rel.target);
                if (event) acc.push(event);
                return acc;
            }, []);
        const reciprocalEvents: Event[] = this.getEvents().filter(event =>
            event.relations.find(rel => rel.label === 'character' && rel.target === character.id)
        );

        const events: Event[] = [];
        for (const event of characterEvents) {
            if (!events.find(f => f.id === event.id)) {
                events.push(event);
            }
        }
        for (const event of reciprocalEvents) {
            if (!events.find(f => f.id === event.id)) {
                events.push(event);
            }
        }
        return events;
    }

    getEvent(path: string): Event | undefined {
        const element = this.getElement(path);
        return element?.getType() === 'event' ? element as Event : undefined;
    }

    // ============================== FACTIONS ============================== //

    getFactions(): Faction[] {
        return this.getElementsPerType('faction') as Faction[];
    }

    getFactionsForCharacter(character: Character): Faction[] {
        const characterFactions: Faction[] = character.relations
            .reduce((acc: Faction[], rel) => {
                const faction = this.getFaction(rel.target);
                if (faction) acc.push(faction);
                return acc;
            }, []);
        const reciprocalFactions: Faction[] = this.getFactions().filter(faction =>
            faction.relations.find(rel => rel.label === 'character' && rel.target === character.id)
        );

        const factions: Faction[] = [];
        for (const faction of characterFactions) {
            if (!factions.find(f => f.id === faction.id)) {
                factions.push(faction);
            }
        }
        for (const faction of reciprocalFactions) {
            if (!factions.find(f => f.id === faction.id)) {
                factions.push(faction);
            }
        }
        return factions;
    }

    getFaction(path: string): Faction | undefined {
        const element = this.getElement(path);
        return element?.getType() === 'faction' ? element as Faction : undefined;
    }

    // =============================== PLACES =============================== //

    getPlaces(): Place[] {
        return this.getElementsPerType('place') as Place[];
    }

    getPlace(path: string): Place | undefined {
        const element = this.getElement(path);
        return element?.getType() === 'place' ? element as Place : undefined;
    }

    // =============================== METRICS ============================== //

    getCentrality(id: string): number {
        return this.#centralityScores[id] || 0;
    }
}