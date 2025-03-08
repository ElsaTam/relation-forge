import type { IReason } from "src/internal";

// Helper class to track scores and reasons
export class ScoreCard {
    private candidateId: string;
    private scores: Map<string, number> = new Map();
    private reasons: IReason[] = [];

    constructor(candidateId: string) {
        this.candidateId = candidateId;
    }

    public addScore(category: string, score: number, reason: string): void {
        this.scores.set(category, (this.scores.get(category) || 0) + score);
        if (score !== 0) this.reasons.push({ description: reason, score: score });
    }

    public getTotalScore(): number {
        return Array.from(this.scores.values()).reduce((sum, score) => sum + score, 0);
    }

    public getReasons(): IReason[] {
        return this.reasons.sort((a, b) => b.score - a.score);
    }
}