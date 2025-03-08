<script lang="ts">
    interface Props {
        error: Error;
    }

    let { error }: Props = $props();
</script>

<pre class="error">
    <span class="error_message">{error.message}</span>
    {#if error.stack}
        <div class="error_stack">
            {error.stack.trim()}
        </div>
    {/if}
</pre>
