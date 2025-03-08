<script lang="ts">
    import type { App } from "obsidian";
    import type { IRelation, ITriad } from "src/internal";

    interface Props {
        app: App;
        triad: ITriad;
    }
    const { app, triad }: Props = $props();

    function getSign(relation: IRelation): number {
        return relation ? (relation.influence > 0 ? 1 : -1) : 0;
    }

    function getDisplayName(path: string) {
        return app.vault.getFileByPath(path)?.basename ?? undefined;
    }
</script>

<div>
    <ul>
        {#each triad.relationships as relation}
            <li>
                {#if getSign(relation) === 0}
                    <strong>{getDisplayName(relation.source)}</strong> has no
                    relationship with
                    <strong>{getDisplayName(relation.target)}</strong>
                {:else}
                    <strong>{getDisplayName(relation.source)}</strong> has a
                    {#if getSign(relation) > 0}
                        positive
                    {:else}
                        negative
                    {/if}
                    relation with
                    <strong>{getDisplayName(relation.target)}</strong>
                    ({relation.type})
                {/if}
            </li>
        {/each}
    </ul>
    <div>
        {#if triad.isBalanced}
            This triad is stable according to balance theory.
            {#if getSign(triad.relationships[0]) > 0 && getSign(triad.relationships[1]) > 0 && getSign(triad.relationships[2]) > 0}
                All three characters have positive relationships, forming a
                cohesive group.
            {:else}
                Two characters share a mutual dislike of the third, creating an
                'enemy of my enemy is my friend' dynamic.
            {/if}
        {:else}
            This triad is unstable according to balance theory.
            {#if getSign(triad.relationships[0]) < 0 && getSign(triad.relationships[1]) < 0 && getSign(triad.relationships[2]) < 0}
                All three characters have negative relationships with each
                other, creating a volatile situation.
            {:else}
                One character is caught between positive relationships with two
                characters who dislike each other.
            {/if}
        {/if}
    </div>
</div>
