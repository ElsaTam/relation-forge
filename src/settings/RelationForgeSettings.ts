import { AnalysisThresholds, AnalysisWeights, DEFAULT_RANGES, PropertyDescriptions, type ElementType, type PropertyMap, type PropertyTypes, type RangeConfiguration, type RelationAttribute } from "src/internal";

export interface RelationForgeSettings {
    weights: AnalysisWeights;
    thresholds: AnalysisThresholds;
    rangeProperties: Record<RelationAttribute, RangeConfiguration>;
    properties: PropertyMap;
}

export const DEFAULT_SETTINGS: RelationForgeSettings = {
    weights: new AnalysisWeights(),
    thresholds: new AnalysisThresholds(),
    rangeProperties: DEFAULT_RANGES,
    properties: PropertyDescriptions.propertyMap,
}