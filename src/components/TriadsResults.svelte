<script lang="ts">
	import { type App } from "obsidian";
	import type { ITriad, IFindUnstableTriadsQuery } from "src/internal";
	import TriadBalanceDescription from "./tags/TriadBalanceDescription.svelte";
	import { MoveHorizontal } from "lucide-svelte";
	import ResultLayout from "./ResultLayout.svelte";
	import { onMount } from "svelte";

	interface Props {
		app: App;
		query: IFindUnstableTriadsQuery;
		fetchResults: () => Promise<ITriad[]>;
	}

	let { app, query, fetchResults }: Props = $props();
	let results: ITriad[] = $state([]);

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
		Found {results.length} unstable triads
	{/snippet}

	<!-----------------------------     EMPTY     ----------------------------->

	{#snippet noResult()}
		No unstable triad found
	{/snippet}

	<!-------------------------     ITEM SUMMARY     -------------------------->

	{#snippet itemText(triad: ITriad)}
		{triad.characters[0].name}
		<MoveHorizontal class="svg-icon inline-icon" />
		{triad.characters[1].name}
		<MoveHorizontal class="svg-icon inline-icon" />
		{triad.characters[2].name}
	{/snippet}

	{#snippet itemScore(triad: ITriad)}
		{formatScore(triad.tension)}
	{/snippet}

	<!-------------------------     ITEM DETAILS     -------------------------->

	{#snippet itemDetails(triad: ITriad)}
		<div class="result-item">
			<TriadBalanceDescription {app} {triad} />
		</div>
	{/snippet}
</ResultLayout>
