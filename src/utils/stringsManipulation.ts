
export function splitCamelCase(str: string): string[] {
    return str.split(/(?<=[a-z])(?=[A-Z])/);
}

export function capitalizeFirstLetter(str: string): string {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export function wordsToSentence(words: string[]): string {
    return capitalizeFirstLetter(words.join(' '));
}

export function camelCaseToSentence(str: string): string {
    return wordsToSentence(splitCamelCase(str));
}