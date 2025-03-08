<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import RefreshButton from "./tags/RefreshButton.svelte";
    import FoldIcon from "./tags/FoldIcon.svelte";

    interface Props {
        results: any[];
        refreshButtonClicked: () => void;
        header: Snippet;
        noResult: Snippet;
        itemText: Snippet;
        itemScore: Snippet;
        itemDetails: Snippet;
        itemAdditional?: Snippet;
    }

    let {
        results,
        refreshButtonClicked,
        header,
        noResult,
        itemText,
        itemScore,
        itemDetails,
        itemAdditional = undefined,
    } = $props();

    // Track which ally details are expanded
    let expanded: Record<string, boolean> = $state({});

    // Function to toggle the expanded state
    function toggleExpand(index: number) {
        expanded[index] = !expanded[index];
    }

    onMount(() => {
        // Initialize all as collapsed
        for (const i in results) {
            expanded[i] = false;
        }
    });
</script>

<div class="search-results-info">
    <div class="search-results-result-count">
        {@render header()}
    </div>
    <RefreshButton onclick={(e: Event) => refreshButtonClicked(e)} />
</div>

<div class="search-result-container">
    {#if results.length === 0}
        <div class="no-results">{@render noResult()}</div>
    {:else}
        {#each results as result, index}
            <div
                class="tree-item search-result {expanded[index]
                    ? ''
                    : 'is-collapsed'}"
            >
                <!-- svelte-ignore a11y_interactive_supports_focus -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                    class="tree-item-self search-result-file-title is-clickable"
                    draggable="true"
                    onclick={() => toggleExpand(index)}
                    role="button"
                >
                    <FoldIcon expanded={expanded[index]} />
                    <div class="tree-item-inner-text">
                        {@render itemText(result)}
                    </div>

                    {@render itemAdditional?.(result)}

                    <div class="tree-item-flair-outer">
                        <span class="tree-item-flair">
                            {@render itemScore(result)}
                        </span>
                    </div>
                </div>

                {#if expanded[index]}
                    <div class="result-list">
                        {@render itemDetails(result)}
                    </div>
                {/if}
            </div>
        {/each}
    {/if}
</div>
