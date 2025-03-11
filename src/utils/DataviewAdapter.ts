import { App } from "obsidian";
import { getAPI } from "obsidian-dataview";
import { type IDVResult } from "src/internal";

export class DataviewAdapter {
    dv: any;

    constructor(app: App) {
        this.dv = getAPI(app);
    }

    static async waitForAPI(app: App): Promise<void> {
        let waitingTime = 2000;
        const delay = 400;
        return new Promise((resolve, reject) => {
            const wait = setInterval(function () {
                waitingTime += delay;
                if (getAPI(app)) {
                    waitingTime = 0;
                    clearInterval(wait);
                    resolve();
                } else if (waitingTime > 2000) {
                    waitingTime = 0;
                    clearInterval(wait);
                    reject();
                }
            }, delay);
        });
    }

    static isInitialized(app: App): boolean {
        return getAPI(app).index.initialized;
    }

    page(path: string): Record<string, any> {
        return this.dv.page(path);
    }

    async characterPages(): Promise<IDVResult> {
        return await this.dv.query("LIST WHERE type=\"character\"");
    }

    async eventPages(): Promise<IDVResult> {
        return await this.dv.query("LIST WHERE type=\"event\"");
    }

    async factionPages(): Promise<IDVResult> {
        return await this.dv.query("LIST WHERE type=\"faction\"");
    }

    async placePages(): Promise<IDVResult> {
        return await this.dv.query("LIST WHERE type=\"place\"");
    }

    static getNumberProperty(page: any, key: string, min?: number, max?: number): number | undefined {
        let value = page[key] ?? undefined;
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        if (typeof value === 'number' && !isNaN(value)) {
            if (min !== undefined) {
                value = Math.max(min, value);
            }
            if (max !== undefined) {
                value = Math.min(max, value);
            }
        }
        else {
            value = undefined;
        }
        return value;
    }

    static getStringProperty(page: any, key: string): string | undefined {
        let value = page[key] ?? undefined;
        if (typeof value === 'number') {
            value = value.toString();
        }
        if (typeof value !== 'string') {
            value = undefined;
        }
        return value;
    }
}
