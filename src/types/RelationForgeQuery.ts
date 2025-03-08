import type {
    ICompleteTriadQuery,
    IFindAlliesQuery,
    IFindInfluencePathsQuery,
    IFindUnstableTriadsQuery
} from "src/internal";

export interface RelationForgeQuery {
    function:
    'COMPLETE TRIAD'
    | 'FIND ALLIES'
    | 'FIND INFLUENCE PATHS'
    | 'FIND UNSTABLE TRIADS'
    | '';
    source?: string;
    target?: string;
    options: Record<string, string | undefined>;
}

export type AlgorithmQuery =
    ICompleteTriadQuery
    | IFindAlliesQuery
    | IFindUnstableTriadsQuery
    | IFindInfluencePathsQuery;
