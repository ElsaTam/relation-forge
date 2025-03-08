<script lang="ts">
	import type { App } from "obsidian";
	import type {
		ITriadCompletionRecommendation,
		ICompleteTriadQuery,
	} from "src/internal";
	import { onMount } from "svelte";
	import FileLink from "./tags/FileLink.svelte";
	import TriadCompletionDescription from "./tags/TriadCompletionDescription.svelte";
	import { MoveRight } from "lucide-svelte";
	import AddButton from "./tags/AddButton.svelte";
	import ResultLayout from "./ResultLayout.svelte";

	interface Props {
		app: App;
		query: ICompleteTriadQuery;
		fetchResults: () => Promise<ITriadCompletionRecommendation[]>;
		createRelation: (
			completion: ITriadCompletionRecommendation,
		) => Promise<void>;
	}

	let { app, query, fetchResults, createRelation }: Props = $props();
	let results: ITriadCompletionRecommendation[] = $state([]);

	// Function to format the score with proper rounding
	function formatScore(score: number): string {
		return (Math.round((score + Number.EPSILON) * 1000) / 1000).toString();
	}

	function getSource(completion: ITriadCompletionRecommendation) {
		return completion.newRelation.source === completion.newCharacter.id
			? completion.newCharacter
			: completion.newRelation.source === completion.existingCharacter1.id
				? completion.existingCharacter1
				: completion.existingCharacter2;
	}

	function getTarget(completion: ITriadCompletionRecommendation) {
		return completion.newRelation.target === completion.newCharacter.id
			? completion.newCharacter
			: completion.newRelation.target === completion.existingCharacter1.id
				? completion.existingCharacter1
				: completion.existingCharacter2;
	}

	function addButtonClicked(
		event: Event,
		completion: ITriadCompletionRecommendation,
	) {
		event.stopPropagation();
		createRelation(completion);
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
		Found {results.length} triad completion recommendations for
		<FileLink {app} path={query.source} />
		and
		<FileLink {app} path={query.target} />
	{/snippet}

	<!-----------------------------     EMPTY     ----------------------------->

	{#snippet noResult()}
		No recommendation found
	{/snippet}

	<!-------------------------     ITEM SUMMARY     -------------------------->

	{#snippet itemText(item: ITriadCompletionRecommendation)}
		{getSource(item).name}
		<MoveRight class="svg-icon inline-icon" />
		{getTarget(item).name}
	{/snippet}

	{#snippet itemAdditional(item: ITriadCompletionRecommendation)}
		<AddButton onclick={(e: Event) => addButtonClicked(e, item)} />
	{/snippet}

	{#snippet itemScore(item: ITriadCompletionRecommendation)}
		{formatScore(item.score)}
	{/snippet}

	<!-------------------------     ITEM DETAILS     -------------------------->

	{#snippet itemDetails(item: ITriadCompletionRecommendation)}
		<div class="result-item">
			<TriadCompletionDescription completion={item} />
		</div>
	{/snippet}
</ResultLayout>
