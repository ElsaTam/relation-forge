export type InfluenceModelType = 'multiplicative' | 'weightedAverage' | 'harmonicMean' | 'weakestLink' | 'networkFlow' | 'socialDecay';

export function isInfluenceModelType(keyInput: string | undefined): keyInput is InfluenceModelType {
    return !!keyInput && ['multiplicative', 'weightedAverage', 'harmonicMean', 'weakestLink', 'networkFlow', 'socialDecay'].includes(keyInput);
}