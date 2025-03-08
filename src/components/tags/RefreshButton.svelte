<script lang="ts">
    import { RefreshCcw } from "lucide-svelte";

    let { onclick } = $props();
</script>

<button {onclick} class="clickable-icon">
    <RefreshCcw class="svg-icon" />
</button>
