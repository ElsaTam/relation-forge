<script lang="ts">
	import type { App } from "obsidian";
	import type { IAlly, IFindAlliesQuery } from "src/internal";
	import FileLink from "./tags/FileLink.svelte";
	import FoldIcon from "./tags/FoldIcon.svelte";
	import ResultLayout from "./ResultLayout.svelte";
	import { onMount } from "svelte";

	interface Props {
		app: App;
		query: IFindAlliesQuery;
		fetchResults: () => Promise<IAlly[]>;
	}

	let { app, query, fetchResults }: Props = $props();
	let results: IAlly[] = $state([]);

	// Function to format the score with proper rounding
	function formatScore(score: number = 1): string {
		return Math.round(score).toString();
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
		Found {results.length} potential allies to help
		<FileLink {app} path={query.source} />
		against
		<FileLink {app} path={query.target} />
	{/snippet}

	<!-----------------------------     EMPTY     ----------------------------->

	{#snippet noResult()}
		No potential allies found
	{/snippet}

	<!-------------------------     ITEM SUMMARY     -------------------------->

	{#snippet itemText(ally: IAlly)}
		<div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="tree-item-inner-text"
				onclick={() => {
					const file = app.vault.getFileByPath(ally.id);
					if (file) app.workspace.getLeaf(false).openFile(file);
				}}
			>
				{ally.name}
			</div>
			{#if ally.description}
				<div class="tree-item-inner-subtext">
					{ally.description}
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet itemScore(ally: IAlly)}
		{formatScore(ally.score)}
	{/snippet}

	<!-------------------------     ITEM DETAILS     -------------------------->

	{#snippet itemDetails(ally: IAlly)}
		{#each ally.reasons as reason}
			<div class="result-item">
				<div class="result-item-description">
					{reason.description}
				</div>
				<div class="result-item-flair">
					{formatScore(reason.score)}
				</div>
			</div>
		{/each}
	{/snippet}
</ResultLayout>
