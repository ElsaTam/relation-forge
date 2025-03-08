<script lang="ts">
    import type { App } from "obsidian";
    import type {
        IInfluencePath,
        IFindInfluencePathsQuery,
    } from "src/internal";
    import { onMount } from "svelte";
    import FileLink from "./tags/FileLink.svelte";
    import ResultLayout from "./ResultLayout.svelte";
    import { ChevronRight } from "lucide-svelte";

    interface Props {
        app: App;
        query: IFindInfluencePathsQuery;
        fetchResults: () => Promise<IInfluencePath[]>;
    }

    let { app, query, fetchResults }: Props = $props();
    let results: IInfluencePath[] = $state([]);

    // Function to format the score with proper rounding
    function formatScore(influence: number): string {
        return (
            Math.round((influence + Number.EPSILON) * 100) / 100
        ).toString();
    }

    // Function to get a color based on influence strength
    function getInfluenceLevel(influence: number): string {
        if (Math.abs(influence) > 5) return "score-high";
        if (Math.abs(influence) > 2) return "score-medium";
        if (Math.abs(influence) >= 0) return "score-low";
        return "";
    }

    function refreshButtonClicked(event: Event) {
        event.stopPropagation();
        refresh();
    }

    async function refresh() {
        results = await fetchResults();
    }

    onMount(() => {
        refresh();
    });
</script>

<ResultLayout {results} {refreshButtonClicked}>
    <!----------------------------     HEADER     ----------------------------->

    {#snippet header()}
        Found {results.length} influence paths from
        <FileLink {app} path={query.source} />
        to
        <FileLink {app} path={query.target} />
    {/snippet}

    <!-----------------------------     EMPTY     ----------------------------->

    {#snippet noResult()}
        No influence paths found between these characters
    {/snippet}

    <!-------------------------     ITEM SUMMARY     -------------------------->

    {#snippet itemText(path: IInfluencePath)}
        {#each path.elements as character, index}
            <span>{character.name}</span>
            {#if index < path.elements.length - 1}
                <ChevronRight class="svg-icon inline-icon" />
            {/if}
        {/each}
    {/snippet}

    {#snippet itemScore(path: IInfluencePath)}
        <span>
            {formatScore(path.totalInfluence)}
        </span>
    {/snippet}

    <!-------------------------     ITEM DETAILS     -------------------------->

    {#snippet itemDetails(path: IInfluencePath)}
        {#each path.elements as character, index}
            <div class="result-item">
                <div class="element-node">
                    <FileLink {app} path={character.id} />
                    {#if character.description}
                        <span class="element-description">
                            {character.description}
                        </span>
                    {/if}
                </div>

                {#if index < path.elements.length - 1}
                    <div
                        class="result-item-flair relation-label {getInfluenceLevel(
                            path.relations[index].influence,
                        )}"
                    >
                        {#if path.relations[index].type}
                            {path.relations[index].type}
                        {/if}

                        ({formatScore(path.relations[index].influence)}) ↓
                    </div>
                {/if}
            </div>
        {/each}
    {/snippet}
</ResultLayout>
