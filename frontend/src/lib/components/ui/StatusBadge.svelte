<script lang="ts">
    import type { Snippet } from "svelte";

    type Tone = "neutral" | "info" | "success" | "warning" | "danger";

    let {
        tone = "neutral",
        extraClass = "",
        children,
        ...rest
    } = $props<{
        tone?: Tone;
        extraClass?: string;
        children?: Snippet;
        [key: string]: unknown;
    }>();

    function getToneClasses(value: Tone): string {
        switch (value) {
            case "info":
                return "border-blue-200 bg-blue-50 text-blue-700";
            case "success":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";
            case "warning":
                return "border-amber-200 bg-amber-50 text-amber-700";
            case "danger":
                return "border-red-200 bg-red-50 text-red-700";
            default:
                return "border-slate-300 bg-slate-100 text-slate-700";
        }
    }

    const classes = $derived(
        `${getToneClasses(tone)} inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${extraClass}`,
    );
</script>

<span class={classes} {...rest}>
    {@render children?.()}
</span>
