<script lang="ts">
	import { onMount } from 'svelte'
	import Peaks from '$lib/peaks.svelte'
	import { boardContent, currentRow, currentTile, validLetters, gameFinished } from '$lib/store'
	import { getValidLetterBounds } from '$lib/data-model'
	import Tile from '$lib/tile.svelte'

	let ready = false
	// Prevents SSR for board
	onMount(() => (ready = true))
</script>

<div class="container">
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
						/>
					{/each}
				</div>
			{/each}
		</div>
		<div class="graph" class:minimized={$currentRow === 0}>
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
		user-select: none;
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
		transition: width 400ms ease-in-out, margin-left 400ms ease-in-out;
		height: 23.25rem;
	}

	.graph.minimized {
		width: 0;
		margin-left: 0;
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
