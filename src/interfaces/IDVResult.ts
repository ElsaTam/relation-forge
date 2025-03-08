export interface IDVResult {
    successful: boolean;
    value: {
        type: string;
        values: {
            path: string,
            display?: boolean,
            subpath?: string,
            embed: boolean,
            type: string
        }[];
    }
}