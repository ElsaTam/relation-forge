<script lang="ts">
    import type {
        IRelation,
        ITriadCompletionRecommendation,
    } from "src/internal";

    interface Props {
        completion: ITriadCompletionRecommendation;
    }
    const { completion }: Props = $props();

    const source =
        completion.newRelation.source === completion.newCharacter.id
            ? completion.newCharacter
            : completion.newRelation.source === completion.existingCharacter1.id
              ? completion.existingCharacter1
              : completion.existingCharacter2;
    const target =
        completion.newRelation.target === completion.newCharacter.id
            ? completion.newCharacter
            : completion.newRelation.target === completion.existingCharacter1.id
              ? completion.existingCharacter1
              : completion.existingCharacter2;

    function getName(id: string): string {
        if (id === completion.existingCharacter1.id) {
            return completion.existingCharacter1.name;
        }
        if (id === completion.existingCharacter2.id) {
            return completion.existingCharacter2.name;
        }
        if (id === completion.newCharacter.id) {
            return completion.newCharacter.name;
        }
        return id;
    }

    function formatRelationshipWithStrength(rel: IRelation): string {
        rel.affinity = rel.affinity ?? 0;
        rel.type === "" ? "relation" : rel.type;
        const affinityDesc =
            Math.abs(rel.affinity) <= 3
                ? "weak"
                : Math.abs(rel.affinity) <= 6
                  ? "moderate"
                  : "strong";

        if (rel.affinity > 0) {
            return `${affinityDesc} ${rel.type} (${rel.affinity}) between ${getName(rel.source)} and ${getName(rel.target)}`;
        } else {
            return `${affinityDesc} ${rel.type} (${rel.affinity}) between ${getName(rel.source)} and ${getName(rel.target)}`;
        }
    }
</script>

<div>
    Based on the existing {formatRelationshipWithStrength(
        completion.relationBetween1And2,
    )} and {formatRelationshipWithStrength(
        completion.relationBetweenExistingAndNew,
    )}, a
    {#if (completion.newRelation.affinity ?? 0) > 0}
        positive
    {:else if completion.newRelation.affinity === 0}
        neutral
    {:else}
        negative
    {/if}
    relation between {source.name} and {target.name} with an affinity of {Math.round(
        completion.newRelation.affinity ?? 0,
    )} would create a balanced triad.
</div>
