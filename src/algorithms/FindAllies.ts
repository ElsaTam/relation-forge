import {
    Character,
    Event,
    Faction,
    Graph,
    type IAlgorithm,
    type IAlly,
    type IFindAlliesQuery,
    type RelationForgeSettings,
    ScoreCalculator,
    ScoreCard,
    type IFindAlliesOptions,
    assignDefined
} from 'src/internal';
import { astar } from 'graphology-shortest-path';


/**
 * * Rules used to compute score
 * ? Direct relationship between source, candidate and target
 * - relation from source to candidate:
 *     - [bonus] source is friend with candidate (relation.affinity > 0)
 *     - [malus] source is enemy with candidate (relation.affinity < 0)
 *     - [bonus] source trusts candidate (relation.trust > 0)
 *     - [malus] source mistrusts candidate (relation.trust < 0)
 *     - [bonus] source has influence over candidate (relation.influence)
 * - relation from candidate to source:
 *     - [bonus] candidate is friend with source (relation.affinity > 0)
 *     - [malus] candidate is enemy with source (relation.affinity < 0)
 *     - [bonus] candidate trusts source (relation.trust > 0)
 *     - [malus] candidate mistrusts source (relation.trust < 0)
 * - relation from candidate to target:
 *     - [bonus] candidate is enemy with target (relation.affinity < 0)
 *     - [malus] candidate is friend with target (relation.affinity > 0)
 *     - [bonus] candidate has influence over target (relation.influence)
 * - relation from target to candidate:
 *     - [bonus] target trusts candidate (relation.trust > 0)
 *     - [malus] target mistrusts candidate (relation.trust < 0)
 * ? Common relations
 * - [bonus] common allies (length)
 * - [bonus] common enemy (length)
 * ? Influence path
 * - [malus] shortest weighted distance between source and candidate (astar.length)
 * - [malus] shortest weighted distance between candidate and target (astar.length)
 * ? Centrality
 * - [bonus] centrality of candidate
 * ? Faction influence
 * - [bonus] source and candidate are in the same faction (faction.power)
 * - [bonus] target and candidate are in the same faction (faction.power)
 * - [bonus] candidate has influence in the target faction (relation.influence)
 * - [malus] target has influence in the candidate faction (relation.influence)
 * ? Shared events
 * - [bonus] source and candidate have been at the same event (event.importance)
 */
export class FindAllies implements IAlgorithm {
    private graph: Graph;
    private settings: RelationForgeSettings;

    constructor(graph: Graph, settings: RelationForgeSettings) {
        this.graph = graph;
        this.settings = settings;
    }

    public async exec(query: IFindAlliesQuery): Promise<IAlly[]> {
        // Set default options
        const opts: IFindAlliesOptions = assignDefined({}, query.options);

        // Get all candidates
        const candidates: Character[] = this.graph.getCharacters()
            .filter(character => character.id !== query.source && character.id !== query.target);

        if (candidates.length === 0) return [];

        // Get source and target characters
        const source = this.graph.getCharacter(query.source);
        const target = this.graph.getCharacter(query.target);
        if (!source || !target) return [];

        // Get events
        const sourceEvents: Event[] = this.graph.getEventsForCharacter(source);

        // Get factions
        const sourceFactions: Faction[] = this.graph.getFactionsForCharacter(source);
        const targetFactions: Faction[] = this.graph.getFactionsForCharacter(target);

        // Collect all found potential allies
        let potentialAllies: IAlly[] = [];

        for (const candidate of candidates) {
            const scoreCard = new ScoreCard(candidate.id);

            this.calculateDirectRelationsScore(scoreCard, source, candidate, target);
            this.calculateCommonRelationsScore(scoreCard, source, candidate, target);
            this.calculateInfluencePathScore(scoreCard, source, candidate, target);
            this.calculateCentralityScore(scoreCard, candidate);
            this.calculateFactionCoherenceScore(scoreCard, source, candidate, target,
                { source: sourceFactions, target: targetFactions, candidate: await this.graph.getFactionsForCharacter(candidate) });
            this.calculateSharedEventsScore(scoreCard, source, candidate,
                { source: sourceEvents, candidate: await this.graph.getEventsForCharacter(candidate) });


            potentialAllies.push({
                id: candidate.id,
                name: candidate.name,
                description: candidate.description,
                score: scoreCard.getTotalScore(),
                reasons: scoreCard.getReasons()
            });
        }

        potentialAllies = potentialAllies.filter(a => a.score > 0);
        if (opts.sort) {
            const sort = opts.sort;
            potentialAllies = potentialAllies.sort((a, b) => sort * (a.score - b.score));
        }
        if (opts.max && opts.max > 0) {
            potentialAllies = potentialAllies.slice(0, opts.max);
        }

        return potentialAllies;
    }

    private calculateDirectRelationsScore(scoreCard: ScoreCard, source: Character, candidate: Character, target: Character): void {
        // from source to candidate
        if (this.graph.hasRelation(source.id, candidate.id)) {
            const relation = this.graph.getRelation(source.id, candidate.id);

            if (relation.affinity && relation.affinity.value > this.settings.thresholds.positiveAffinity) {
                scoreCard.addScore('source_friend_candidate', ScoreCalculator.affinity(relation, this.settings),
                    `Is liked by ${source.name}`);
            }
            else if (relation.affinity && relation.affinity.value < this.settings.thresholds.negativeAffinity) {
                scoreCard.addScore('source_enemy_candidate', -1 * ScoreCalculator.affinity(relation, this.settings),
                    `Is disliked by ${source.name}`);
            }

            if (relation.trust && relation.trust.value > this.settings.thresholds.positiveTrust) {
                scoreCard.addScore('source_trusts_candidate', ScoreCalculator.trust(relation, this.settings),
                    `Is trusted by ${source.name}`);
            }
            else if (relation.trust && relation.trust.value < this.settings.thresholds.negativeTrust) {
                scoreCard.addScore('source_mistrusts_candidate', -1 * ScoreCalculator.trust(relation, this.settings),
                    `Is mistrusted by ${source.name}`);
            }

            if (relation.influence.value > this.settings.thresholds.influence) {
                scoreCard.addScore('source_influences_candidate', ScoreCalculator.influence(relation, this.settings),
                    `Is influenced by ${source.name}`);
            }
        }

        // from candidate to source
        if (this.graph.hasRelation(candidate.id, source.id)) {
            const relation = this.graph.getRelation(candidate.id, source.id);

            if (relation.affinity && relation.affinity.value > this.settings.thresholds.positiveAffinity) {
                scoreCard.addScore('candidate_friend_source', ScoreCalculator.affinity(relation, this.settings),
                    `Likes ${source.name}`);
            }
            else if (relation.affinity && relation.affinity.value < this.settings.thresholds.negativeAffinity) {
                scoreCard.addScore('candidate_enemy_source', -1 * ScoreCalculator.affinity(relation, this.settings),
                    `Dislikes ${source.name}`);
            }

            if (relation.trust && relation.trust.value > this.settings.thresholds.positiveTrust) {
                scoreCard.addScore('candidate_trusts_source', ScoreCalculator.trust(relation, this.settings),
                    `Trusts ${source.name}`);
            }
            else if (relation.trust && relation.trust.value < this.settings.thresholds.negativeTrust) {
                scoreCard.addScore('candidate_mistrusts_source', -1 * ScoreCalculator.trust(relation, this.settings),
                    `Mistrusts ${source.name}`);
            }
        }

        // from candidate to target
        if (this.graph.hasRelation(candidate.id, target.id)) {
            const relation = this.graph.getRelation(candidate.id, target.id);

            if (relation.affinity && relation.affinity.value < this.settings.thresholds.negativeAffinity) {
                scoreCard.addScore('candidate_enemy_target', ScoreCalculator.affinity(relation, this.settings),
                    `Dislikes ${target.name}`);
            }
            else if (relation.affinity && relation.affinity.value > this.settings.thresholds.positiveAffinity) {
                scoreCard.addScore('candidate_friend_target', -1 * ScoreCalculator.affinity(relation, this.settings),
                    `Likes ${target.name}`);
            }

            if (relation.influence.value > this.settings.thresholds.influence) {
                scoreCard.addScore('candidate_influences_target', ScoreCalculator.influence(relation, this.settings),
                    `Has influence over ${target.name}`);
            }
        }

        // from target to candidate
        if (this.graph.hasRelation(target.id, candidate.id)) {
            const relation = this.graph.getRelation(target.id, candidate.id);

            if (relation.trust && relation.trust.value > this.settings.thresholds.positiveTrust) {
                scoreCard.addScore('target_trusts_candidate', ScoreCalculator.trust(relation, this.settings),
                    `Is trusted by ${target.name}`);
            }
            else if (relation.trust && relation.trust.value < this.settings.thresholds.negativeTrust) {
                scoreCard.addScore('target_mistrusts_candidate', -1 * ScoreCalculator.trust(relation, this.settings),
                    `Is mistrusted by ${target.name}`);
            }
        }
    }

    private calculateCommonRelationsScore(scoreCard: ScoreCard, source: Character, candidate: Character, target: Character): void {
        // Common enemies (except target)
        const sourceEnemies = this.graph.getOutRelations(source.id).filter(rel => {
            return rel.target !== target.id && rel.target !== source.id && rel.target !== candidate.id &&
                rel.affinity && rel.affinity.value < this.settings.thresholds.negativeAffinity;
        });

        const candidateEnemies = this.graph.getOutRelations(candidate.id).filter(rel => {
            return rel.target !== target.id && rel.target !== source.id && rel.target !== candidate.id &&
                rel.affinity && rel.affinity.value < this.settings.thresholds.negativeAffinity;
        });

        const commonEnemies = sourceEnemies.filter(value => candidateEnemies.includes(value));

        if (commonEnemies.length > 0) {
            scoreCard.addScore('common_enemies', ScoreCalculator.commonEnemies(commonEnemies, this.settings),
                `Common enemies`);
        }

        // Common allies
        const sourceAllies = this.graph.getOutRelations(source.id).filter(rel => {
            return rel.target !== target.id && rel.target !== source.id && rel.target !== candidate.id &&
                rel.affinity && rel.affinity.value > this.settings.thresholds.positiveAffinity;
        });

        const candidateAllies = this.graph.getOutRelations(candidate.id).filter(rel => {
            return rel.target !== target.id && rel.target !== source.id && rel.target !== candidate.id &&
                rel.affinity && rel.affinity.value > this.settings.thresholds.positiveAffinity;
        });

        const commonAllies = sourceAllies.filter(value => candidateAllies.includes(value));

        if (commonAllies.length > 0) {
            scoreCard.addScore('common_allies', ScoreCalculator.commonAllies(commonAllies, this.settings),
                `Common allies`);
        }
    }

    private calculateInfluencePathScore(scoreCard: ScoreCard, source: Character, candidate: Character, target: Character): void {
        try {
            const pathSourceToTarget = astar.bidirectional(this.graph.core, source.id, candidate.id, (_, attr) => 10 - attr.influence);
            if (pathSourceToTarget.length > this.settings.thresholds.influencePathLength) {
                const bonus = ScoreCalculator.influencePath(pathSourceToTarget, this.settings);
                scoreCard.addScore('path_source_candidate', -1 * bonus,
                    `Won't be easily influenced by ${source.name}, will need multiple people`);
            }
        } catch (error) {

        }

        try {
            const pathCandidateToTarget = astar.bidirectional(this.graph.core, candidate.id, target.id, (_, attr) => 10 - attr.influence);
            if (pathCandidateToTarget.length > this.settings.thresholds.influencePathLength) {
                const bonus = ScoreCalculator.influencePath(pathCandidateToTarget, this.settings);
                scoreCard.addScore('path_candidate_target', -1 * bonus,
                    `Won't easily influence ${target.name}, will need multiple people`);
            }
        } catch (error) {
            // Pas de chemin trouvé, aucun bonus
        }
    }

    private calculateCentralityScore(scoreCard: ScoreCard, candidate: Character): void {
        if (!this.graph.centralityScores) return;

        const centralityScore: number = this.graph.centralityScores[candidate.id] || 0;
        scoreCard.addScore('candidate_entrality', ScoreCalculator.centrality(centralityScore, this.settings),
            `Centrality in the network`);
    }

    private calculateFactionCoherenceScore(
        scoreCard: ScoreCard, source: Character, candidate: Character, target: Character,
        factions: { source: Faction[], target: Faction[], candidate: Faction[] }
    ): void {
        const commonAllyFactions = factions.source.filter(faction => factions.candidate.find(f => f.id === faction.id));
        for (const faction of commonAllyFactions) {
            scoreCard.addScore('common_ally_faction', ScoreCalculator.faction(faction, this.settings),
                `Is in the same faction as ${source.name}: ${faction.name}`);

        }

        const commonEnemyFactions = factions.target.filter(faction => factions.candidate.find(f => f.id === faction.id));
        for (const faction of commonEnemyFactions) {
            scoreCard.addScore('common_enemy_faction', ScoreCalculator.faction(faction, this.settings),
                `Is in the same faction as ${target.name}: ${faction.name}`);

            const candidateRelation = candidate.relations.find(rel => faction.id === rel.target);
            if (candidateRelation && candidateRelation.influence.value > this.settings.thresholds.influence) {
                scoreCard.addScore('common_enemy_faction', ScoreCalculator.faction(faction, this.settings),
                    `Has influence in faction ${faction.name}`);
            }

            const targetRelation = target.relations.find(rel => faction.id === rel.target);
            if (targetRelation && targetRelation.influence.value > this.settings.thresholds.influence) {
                scoreCard.addScore('common_enemy_faction', -1 * ScoreCalculator.faction(faction, this.settings),
                    `Faction ${faction.name} is influenced by ${target.name}`);
            }
        }
    }

    private calculateSharedEventsScore(
        scoreCard: ScoreCard, source: Character, candidate: Character,
        events: { source: Event[], candidate: Event[] }
    ): void {
        const commonEvents = events.source.filter(event => events.candidate.find(e => e.id === event.id));
        for (const event of commonEvents) {
            scoreCard.addScore('event', ScoreCalculator.event(event, this.settings),
                `Was at the same event than ${source.name}: ${event.name}`);
        }
    }
}