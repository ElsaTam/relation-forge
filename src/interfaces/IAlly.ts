import type { IReason } from "./IReason";

export interface IAlly {
    id: string;
    name: string;
    description: string;
    score: number;
    reasons: IReason[];
}

export interface IFindAlliesQuery {
    source: string;
    target: string;
    options: Partial<IFindAlliesOptions>;
}
export interface IFindAlliesOptions {
    max?: number;
    sort?: -1 | 1; // -1: desc / +1: asc
}