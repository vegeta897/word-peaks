<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import { browser } from '$app/env'

	const { debugMode } = store

	const storeProps = Object.entries(store)
		.filter(
			([propName, propValue]) =>
				typeof propValue !== 'function' && 'update' in propValue && propName !== 'boardContent'
		)
		.map(([propName, propValue]) => {
			return [propName, get(propValue)]
		})
	if (browser) console.log(storeProps)
	const storePropsString = JSON.stringify(storeProps)
</script>

<section>
	<h1>Wordle Peaks Debug Info</h1>
	<div>
		<input type="checkbox" id="debugMode" bind:checked={$debugMode} /><label for="debugMode"
			>Debug Mode</label
		>
	</div>
	{#if browser}
		<button on:click={() => navigator.clipboard.writeText(storePropsString)}>Copy</button>
		<textarea aria-label="Debug text" rows="10" readOnly>{storePropsString}</textarea>
	{/if}
</section>

<style>
	section {
		padding: 8px;
		display: flex;
		flex-direction: column;
	}

	div {
		margin-bottom: 1rem;
	}

	pre {
		display: inline-block;
	}

	input {
		margin-right: 0.5rem;
	}

	textarea {
		margin-top: 8px;
		box-sizing: border-box;
	}
	button {
		border-radius: 6px;
		border: 0;
		padding: 0;
		height: 3rem;
		font-size: 1.4em;
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
