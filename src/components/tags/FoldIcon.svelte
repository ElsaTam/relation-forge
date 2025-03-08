<script lang="ts">
    import { ChevronDown } from "lucide-svelte";

    interface Props {
        expanded: boolean;
    }

    let { expanded }: Props = $props();
</script>

<div class="tree-item-icon collapse-icon {expanded ? '' : 'is-collapsed'}">
    <ChevronDown class="svg-icon" />
</div>
