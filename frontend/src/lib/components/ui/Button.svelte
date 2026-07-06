<script lang="ts">
    import type { Snippet } from "svelte";

    type Variant =
        | "primary"
        | "secondary"
        | "outline"
        | "danger"
        | "success"
        | "warning";
    type Size = "sm" | "md" | "lg";

    let {
        href,
        variant = "primary",
        size = "md",
        type = "button",
        disabled = false,
        extraClass = "",
        children,
        ...rest
    } = $props<{
        href?: string;
        variant?: Variant;
        size?: Size;
        type?: "button" | "submit" | "reset";
        disabled?: boolean;
        extraClass?: string;
        children?: Snippet;
        [key: string]: unknown;
    }>();

    function getVariantClasses(v: Variant): string {
        switch (v) {
            case "secondary":
                return "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-300";
            case "outline":
                return "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200";
            case "danger":
                return "bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-300";
            case "success":
                return "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-300";
            case "warning":
                return "bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-300";
            default:
                return "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-300";
        }
    }

    function getSizeClasses(s: Size): string {
        switch (s) {
            case "sm":
                return "px-3 py-1.5 text-xs";
            case "lg":
                return "px-4 py-3 text-sm";
            default:
                return "px-4 py-2 text-sm";
        }
    }

    const classes = $derived(
        `${getVariantClasses(variant)} ${getSizeClasses(size)} inline-flex items-center justify-center rounded-lg font-semibold transition ${extraClass}`,
    );
</script>

{#if href}
    <a href={href} class={classes} aria-disabled={disabled} {...rest}>
        {@render children?.()}
    </a>
{:else}
    <button {type} {disabled} class={classes} {...rest}>
        {@render children?.()}
    </button>
{/if}
