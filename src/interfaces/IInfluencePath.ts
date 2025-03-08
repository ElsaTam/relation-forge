import { type IRelation, type IElement, type InfluenceModelType } from "src/internal";

export interface IInfluencePath {
    relations: IRelation[];                // Array of element IDs forming the path
    elements: IElement[];          // Array of elements objects in the path
    totalInfluence: number;        // Calculated overall influence strength of the path
}

export interface IFindInfluencePathsQuery {
    source: string;                // ID of the source character
    target: string;                // ID of the target character
    options: Partial<IFindInfluencePathsOptions>;
}

export interface IFindInfluencePathsOptions {
    max?: number;                  // Maximum number of paths to return
    sort?: -1 | 1;                 // -1: desc / +1: asc
    maxPathLength: number;         // Maximum number of intermediate characters in a path
    minRelationInfluence: number;  // Minimum influence strength to consider a connection
    includeNegativePaths: boolean; // Whether to include paths with negative influence
    influenceModel: InfluenceModelType; // Model to use for calculating total influence
}