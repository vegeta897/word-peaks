<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	const storeProps = Object.entries(store)
		.filter(([_, propValue]) => typeof propValue !== 'function' && 'update' in propValue)
		.map(([propName, propValue]) => {
			return [propName, get(propValue)]
		})
	console.log(storeProps)
	const storePropsString = JSON.stringify(storeProps)
</script>

<section>
	<h1>Wordle Peaks Debug Info</h1>
	<button on:click={() => navigator.clipboard.writeText(storePropsString)}>Copy</button>
	<textarea aria-label="Debug text" rows="10" readonly>{storePropsString}</textarea>
</section>

<style>
	section {
		padding: 8px;
		display: flex;
		flex-direction: column;
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
