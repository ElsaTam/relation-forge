import { CompleteTriad, FindAllies, FindInfluencePaths, FindUnstableTriads, Graph, type RelationForgeSettings } from "src/internal";

export class Algorithms {
    completeTriad: CompleteTriad;
    findAllies: FindAllies;
    findInfluencePaths: FindInfluencePaths;
    findUnstableTriads: FindUnstableTriads;

    constructor(graph: Graph, settings: RelationForgeSettings) {
        this.completeTriad = new CompleteTriad(graph, settings);
        this.findAllies = new FindAllies(graph, settings);
        this.findInfluencePaths = new FindInfluencePaths(graph, settings);
        this.findUnstableTriads = new FindUnstableTriads(graph, settings);
    }
}