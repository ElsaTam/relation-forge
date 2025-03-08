import {
    assignDefined,
    InfluenceCalculator,
    type Graph,
    type IAlgorithm,
    type IElement,
    type IFindInfluencePathsOptions,
    type IFindInfluencePathsQuery,
    type IInfluencePath,
    type IRelation,
    type RelationForgeSettings
} from "src/internal";
import { astar } from "graphology-shortest-path";
import { bfsFromNode } from "graphology-traversal/bfs";
import { allSimpleEdgePaths, allSimplePaths } from "graphology-simple-path";

export class FindInfluencePaths implements IAlgorithm {
    private graph: Graph;
    private settings: RelationForgeSettings;

    constructor(graph: Graph, settings: RelationForgeSettings) {
        this.graph = graph;
        this.settings = settings;
    }

    /**
     * Identifies all possible influence paths between two elements,
     * showing how one element might indirectly influence another through intermediaries.
     * 
     * @param query Configuration options including source and target elements
     * @returns Array of influence paths between the elements
     */
    public async exec(query: IFindInfluencePathsQuery): Promise<IInfluencePath[]> {
        // Set default options
        const opts: IFindInfluencePathsOptions = assignDefined({
            maxPathLength: 4,
            minRelationInfluence: 3,
            includeNegativePaths: false,
            influenceModel: 'harmonicMean'
        }, query.options);

        // Collect all found paths
        const paths: IInfluencePath[] = [];
        const edgePaths = allSimpleEdgePaths(this.graph.core, query.source, query.target, { maxDepth: opts.maxPathLength });
        for (const path of edgePaths) {
            let isValid = true;
            const elementList: IElement[] = [this.graph.getElement(query.source)];
            const influences: number[] = [];
            const pathRelations: IRelation[] = [];

            for (const edge of path) {
                const rel = this.graph.getRelationFromID(edge);
                const target = this.graph.getElement(rel.target);

                if (!opts.includeNegativePaths && rel.influence.value < 0) { isValid = false; break; }
                if (Math.abs(rel.influence.value) < opts.minRelationInfluence) { isValid = false; break; }
                if (!target) { isValid = false; break; }

                elementList.push(target);
                influences.push(Math.abs(rel.influence.value))
                pathRelations.push(rel);
            }

            if (isValid) {
                paths.push({
                    elements: elementList,
                    relations: pathRelations,
                    totalInfluence: InfluenceCalculator.calculateTotalInfluence(influences, opts.influenceModel)
                });
            }
        }

        // Sort by total influence and limit results
        if (query.options.sort) {
            const sort = query.options.sort;
            paths.sort((a, b) => sort * ((a.totalInfluence - b.totalInfluence) || (b.elements.length - a.elements.length)));
        }
        if (query.options.max && query.options.max > 0) {
            return paths.slice(0, query.options.max);
        }

        return paths;
    }
}