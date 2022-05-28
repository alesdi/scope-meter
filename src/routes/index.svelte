<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import ScopeBox from "$lib/scope-box/ScopeBox.svelte";
</script>

<svelte:head>
	<title>ScopeMeter</title>
	<meta
		name="description"
		content="Quick and intuitive metering and analysis tool for oscilloscope captured screenshots"
	/>
</svelte:head>

<section>
	<!--Logo -->
	<div class="logo">
		<a href="/">
			<img src="/logo.svg" alt="ScopeMeter" />
		</a>
	</div>
	<ScopeBox />
</section>

<style>
	.logo {
		height: 2em;
		margin-bottom: 1rem;
		text-align: left;
	}

	.logo img {
		height: 100%;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: left;
		flex: 1;
	}
</style>
