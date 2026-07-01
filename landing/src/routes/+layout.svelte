<script lang="ts">
    import '../app.css';
    let { children } = $props();
</script>

<main class="w-full min-h-screen">
    {@render children()}
</main>