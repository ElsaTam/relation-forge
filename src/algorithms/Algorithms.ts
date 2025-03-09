import { Component } from "obsidian";
import type { Forge } from "src/core/Forge";
import { CompleteTriad, FindAllies, FindInfluencePaths, FindUnstableTriads, Graph, type RelationForgeSettings } from "src/internal";

export class Algorithms extends Component {
    #forge: Forge;
    completeTriad: CompleteTriad;
    findAllies: FindAllies;
    findInfluencePaths: FindInfluencePaths;
    findUnstableTriads: FindUnstableTriads;

    constructor(forge: Forge) {
        super();
        this.#forge = forge;
        this.completeTriad = new CompleteTriad(this.#forge);
        this.findAllies = new FindAllies(this.#forge);
        this.findInfluencePaths = new FindInfluencePaths(this.#forge);
        this.findUnstableTriads = new FindUnstableTriads(this.#forge);
    }
}