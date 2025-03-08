import { type AlgorithmQuery } from "src/internal";

export interface IAlgorithm {
    exec(query: AlgorithmQuery): any;
}