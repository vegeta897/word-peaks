<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import { browser } from '$app/environment'

	const storeProps = Object.entries(store)
		.filter(
			([propName, propValue]) =>
				typeof propValue !== 'number' &&
				typeof propValue !== 'string' &&
				typeof propValue !== 'function' &&
				'update' in propValue &&
				propName !== 'boardContent'
		)
		.map(([propName, propValue]) => {
			return [propName, get(propValue as Parameters<typeof get>[0])]
		})
	if (browser) console.log(storeProps)
	const storePropsString = JSON.stringify(storeProps)
</script>

<section>
	<h1>Word Peaks Debug Info</h1>
	{#if browser}
		<button on:click={() => navigator.clipboard.writeText(storePropsString)}>Copy</button>
		<textarea aria-label="Debug text" rows="10" readonly>{storePropsString}</textarea>
	{/if}
</section>

<style>
	section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
	}

	textarea {
		margin-top: 0.5rem;
		box-sizing: border-box;
	}
	button {
		border-radius: 0.5rem;
		border: 0;
		padding: 0;
		height: 3rem;
		font-size: 1.375em;
		font-weight: 700;
		min-width: 10rem;
		background: #04883b;
	}

	button:hover {
		background: var(--correct-color);
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}
</style>
