<script lang="ts">
    import { Plus } from "lucide-svelte";

    let { onclick } = $props();
</script>

<button {onclick} class="add-button clickable-icon">
    <Plus class="svg-icon" />
</button>
