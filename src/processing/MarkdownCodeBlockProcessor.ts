import { App, MarkdownRenderChild, type MarkdownPostProcessorContext } from "obsidian";
import {
    Algorithms,
    type RelationForgeQuery,
    ElementsParser,
    UnstableTriadsProcessor,
    AlliesProcessor,
    type IAlgorithmProcessor,
    TriadCompletionProcessor,
    InfluencePathsProcessor,
    type RelationForgeSettings
} from "src/internal";
import BlockError from "../components/BlockError.svelte";
import { mount } from "svelte";

export class MarkdownCodeBlockProcessor {
    private app: App;
    private settings: RelationForgeSettings;
    private algorithms: Algorithms;

    constructor(app: App, settings: RelationForgeSettings, algorithms: Algorithms) {
        this.app = app;
        this.settings = settings;
        this.algorithms = algorithms;
    }

    public async handleRelationForgeBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
        try {
            const query = this.parseQuery(source);

            let processor: IAlgorithmProcessor;
            switch (query.function) {
                case 'COMPLETE TRIAD':
                    processor = new TriadCompletionProcessor(this.app, this.settings, this.algorithms.completeTriad);
                    break;
                case 'FIND ALLIES':
                    processor = new AlliesProcessor(this.app, this.algorithms.findAllies);
                    break;
                case 'FIND INFLUENCE PATHS':
                    processor = new InfluencePathsProcessor(this.app, this.algorithms.findInfluencePaths);
                    break;
                case 'FIND UNSTABLE TRIADS':
                    processor = new UnstableTriadsProcessor(this.app, this.algorithms.findUnstableTriads);
                    break;
                case '':
                    return;
            }

            const result = await processor.executeQuery(query);
            const child = processor.renderResults(el);

            if (child) ctx.addChild(child)
            else throw new Error("Invalid query");
        }
        catch (error) {
            if (typeof error === "string") {
                error = new Error(error);
            } else if (error instanceof Error) {
                error = error;
            }
            else {
                error = new Error("Error");
            }

            const renderChild = new MarkdownRenderChild(el);
            renderChild.onload = () => {
                mount(BlockError, {
                    target: el,
                    props: {
                        error: error as Error,
                    }
                });
            }
            ctx.addChild(renderChild);
        }
    }

    // Parse the codeblock content into a structured quer
    private parseQuery(content: string): RelationForgeQuery {
        // Remove comments and trim whitespace
        const lines = content
            .split('\n')
            .filter(line => !line.trim().startsWith('//') && line.trim() !== '');

        // Initialize query object with defaults
        const query: RelationForgeQuery = {
            function: '',
            options: {}
        };

        if (lines.length === 0) return query;

        // Extract function name (first line)
        const functionName = lines[0].trimEnd().toUpperCase();
        switch (functionName) {
            case 'COMPLETE TRIAD':
                query.function = 'COMPLETE TRIAD';
                break;
            case 'FIND ALLIES':
                query.function = 'FIND ALLIES';
                break;
            case 'FIND INFLUENCE PATHS':
                query.function = 'FIND INFLUENCE PATHS';
                break;
            case 'FIND UNSTABLE TRIADS':
                query.function = 'FIND UNSTABLE TRIADS';
                break;
        }
        lines.remove(lines[0]);

        // Process SOURCE clause
        const sourceLine = lines.find(line => line.match(/\tSOURCE\s+/i));
        if (sourceLine) {
            lines.remove(sourceLine);
            query.source = ElementsParser.parseLink(this.app, sourceLine.trim());
        }

        // Process TARGET clause
        const targetLine = lines.find(line => line.match(/\tTARGET\s+/i));
        if (targetLine) {
            lines.remove(targetLine);
            query.target = ElementsParser.parseLink(this.app, targetLine.trim());
        }

        // Process CHAR1 clause
        const char1Line = lines.find(line => line.match(/\tCHAR1\s+/i));
        if (char1Line) {
            lines.remove(char1Line);
            query.source = ElementsParser.parseLink(this.app, char1Line.trim());
        }

        // Process CHAR2 clause
        const char2Line = lines.find(line => line.match(/\tCHAR2\s+/i));
        if (char2Line) {
            lines.remove(char2Line);
            query.target = ElementsParser.parseLink(this.app, char2Line.trim());
        }

        // Process OPTION clause and following lines
        const optionLine = lines.find(line => line.match(/\tOPTIONS\s*/i));
        if (optionLine) {
            lines.remove(optionLine);
            while (lines.length > 0) {
                const line = lines.first();
                if (!line) break;
                const words = line.split(':');
                if (words.length < 2) break;
                const key = words[0].trim();
                let value: string = words.splice(1, 1).join(':').trim();
                query.options[key] = value;
                lines.remove(line);
            }
        }

        if (query.options.sort) {
            if (/asc/i.test(query.options.sort)) {
                query.options.sort = '1';
            }
            else if (/desc/i.test(query.options.sort)) {
                query.options.sort = '-1';
            }
        }

        return query;
    }
}