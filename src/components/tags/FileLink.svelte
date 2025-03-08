<script lang="ts">
    import type { App } from "obsidian";

    interface Props {
        app: App;
        path: string;
    }

    let { app, path }: Props = $props();
    const displayName = app.vault.getFileByPath(path)?.basename ?? undefined;
</script>

<a
    data-href={displayName}
    href={path}
    class={displayName ? "internal-link" : "unresolved-link"}
    target="_blank"
    rel="noopener nofollow"
>
    {displayName}
</a>
