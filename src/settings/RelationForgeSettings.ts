import { AnalysisThresholds, AnalysisWeights, DEFAULT_RANGES, type RangeConfiguration, type RelationAttribute } from "src/internal";

export interface RelationForgeSettings {
    weights: AnalysisWeights;
    thresholds: AnalysisThresholds;
    ranges: Record<RelationAttribute, RangeConfiguration>;
}

export const DEFAULT_SETTINGS: RelationForgeSettings = {
    weights: new AnalysisWeights(),
    thresholds: new AnalysisThresholds(),
    ranges: DEFAULT_RANGES,
}