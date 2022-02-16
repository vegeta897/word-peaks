<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import dictionary from '../lib/data/dictionary-filtered.json'
	import targets from '../lib/data/targets-filtered.json'

	let answer = targets[Math.floor(Math.random() * targets.length)]
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>Wordle Peaks</h1>
	The answer is
	<pre>{answer}</pre>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}
</style>
