import { astar } from "graphology-shortest-path";
import type { Attributes } from "graphology-types";
import { Event, Faction, type IRelation, type RelationForgeSettings } from "src/internal";

export class ScoreCalculator {

    public static affinity(relation: IRelation | Attributes, settings: RelationForgeSettings): number {
        if (relation.affinity > 0) {
            const v = Math.max(0, relation.affinity - settings.thresholds.positiveAffinity);
            return v * settings.weights.positiveAffinity;
        }
        else {
            const v = Math.abs(Math.min(0, relation.affinity - settings.thresholds.negativeAffinity));
            return v * settings.weights.negativeAffinity;
        }
    }

    public static trust(relation: IRelation | Attributes, settings: RelationForgeSettings): number {
        if (relation.trust > 0) {
            const v = Math.max(0, relation.trust - settings.thresholds.positiveTrust);
            return v * settings.weights.positiveTrust;
        }
        else {
            const v = Math.abs(Math.min(0, relation.trust - settings.thresholds.negativeTrust));
            return v * settings.weights.negativeTrust;
        }
    }

    public static influence(relation: IRelation | Attributes, settings: RelationForgeSettings): number {
        const v = Math.max(0, relation.influence - settings.thresholds.influence);
        return v * settings.weights.influence;
    }

    public static commonAllies(allies: any[], settings: RelationForgeSettings): number {
        return allies.length * settings.weights.commonAllies;
    }

    public static commonEnemies(ennemies: any[], settings: RelationForgeSettings): number {
        return ennemies.length * settings.weights.commonEnemies;
    }

    public static influencePath(path: astar.BidirectionalAstarResult | string[], settings: RelationForgeSettings): number {
        return path.length * settings.weights.influencePath;
    }

    public static centrality(centralityScore: number, settings: RelationForgeSettings): number {
        return centralityScore * settings.weights.centrality;
    }

    public static faction(faction: Faction, settings: RelationForgeSettings): number {
        return faction.power.value * settings.weights.commonFaction;
    }

    public static event(event: Event, settings: RelationForgeSettings): number {
        return event.importance.value * settings.weights.eventImportance;
    }
}