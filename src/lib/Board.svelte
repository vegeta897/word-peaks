<script lang="ts">
	import { onMount } from 'svelte'
	import Peaks from '$lib/Peaks.svelte'
	import {
		boardContent,
		currentRow,
		currentTile,
		validLetters,
		gameFinished,
		guesses,
	} from '$lib/store'
	import { getValidLetterBounds } from '$lib/data-model'
	import Tile from '$lib/Tile.svelte'
	import { get } from 'svelte/store'

	export let showResults
	export let startCentered

	let preloadedRows = get(guesses).length
	let ready = false

	gameFinished.subscribe(() => {
		if (ready) preloadedRows = 0
	})
	// Prevents SSR for board
	onMount(() => (ready = true))
</script>

<div class="container" on:click={() => $gameFinished && showResults()}>
	{#if ready}
		<div class="board">
			{#each $boardContent as boardRow, r}
				<div class="tile-row">
					{#each boardRow as tile (r + '.' + tile.id)}
						<Tile
							{tile}
							current={r === $currentRow && tile.id === $currentTile}
							gameFinished={$gameFinished}
							validLetterBounds={getValidLetterBounds($validLetters)}
							showHint={!$gameFinished && r > 0}
							animate={r >= preloadedRows && r >= $currentRow - 1}
						/>
					{/each}
				</div>
			{/each}
		</div>
		<div
			class="graph"
			class:minimized={startCentered && $currentRow === 0}
			class:invisible={!startCentered && $currentRow === 0}
		>
			<Peaks />
		</div>
	{:else}
		<div class="loading">loading...</div>
	{/if}
</div>

<style>
	.container {
		margin: 0 auto 20px;
		padding: 0 4px;
		height: 23.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.board {
		display: flex;
		flex-direction: column;
	}

	.tile-row {
		margin-bottom: 0.4rem;
		display: flex;
	}

	.tile-row:last-child {
		margin-bottom: 0;
	}

	.graph {
		margin-left: 0.3rem;
		width: 204px;
		transition: width 400ms ease-in-out, margin-left 400ms ease-in-out, opacity 200ms ease-out;
		height: 23.25rem;
	}

	.graph.minimized {
		width: 0;
		margin-left: 0;
	}

	.graph.invisible {
		opacity: 0;
	}

	.loading {
		color: #999;
		font-size: 1.3em;
	}

	@media (max-width: 480px) {
		.graph {
			width: 118px;
			height: 21.8rem;
		}
	}
</style>
