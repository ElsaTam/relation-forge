export function assignDefined<T extends { [key: string]: any }>(target: T, source: Partial<T>): T {
    for (const key of Object.keys(source)) {
        const val = source[key];
        if (val !== undefined) {
            target[key as keyof T] = val;
        }
    }
    return target;
}