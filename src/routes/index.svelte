<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import ScopeBox from "$lib/scope-box/ScopeBox.svelte";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<ScopeBox />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
</style>
