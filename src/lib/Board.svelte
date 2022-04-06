<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Peaks from '$lib/Peaks.svelte'
	import {
		boardContent,
		currentRow,
		currentTile,
		gameFinished,
		guesses,
		showAllHints,
	} from '$lib/store'
	import Tile from '$lib/Tile.svelte'
	import { get } from 'svelte/store'
	import { trackEvent } from '$lib/plausible'
	import { animationSupported } from '$lib/transitions'
	import { ROWS, WORD_LENGTH } from '$lib/data-model'

	export let startCentered: boolean

	let preloadedRows = get(guesses).length
	let ready = false
	let idle = false
	let canIdle = null

	let idleTimeout

	gameFinished.subscribe(async (finished) => {
		if (ready) preloadedRows = 0
		if (idleTimeout) clearTimeout(idleTimeout)
		if (finished) {
			let thisTimeout: number
			while (true) {
				await new Promise((resolve) => {
					idleTimeout = setTimeout(() => {
						resolve()
					}, 3000)
					thisTimeout = idleTimeout
				})
				if (!document.hidden) break
			}
			if (thisTimeout !== idleTimeout) return
			trackEvent('idleOnFinish')
			if (canIdle === null) canIdle = animationSupported()
			if (canIdle) {
				const scheduler = await import('./idle-scheduler')
				scheduler.initScheduler((ROWS - get(currentRow)) * WORD_LENGTH)
				idle = true
			}
		} else {
			idle = false
		}
	})
	// Prevents SSR for board
	onMount(() => (ready = true))
	onDestroy(() => {
		clearTimeout(idleTimeout)
		idleTimeout = undefined
	})
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
							inCurrentRow={!$gameFinished && r === $currentRow}
							gameFinished={$gameFinished}
							showHint={!$gameFinished && (tile.id === $currentTile || $showAllHints)}
							animate={r >= preloadedRows && r >= $currentRow - 1}
						>
							{#if $gameFinished && idle}
								{#await import('./Idler.svelte') then module}
									<svelte:component this={module.default} id={r + ':' + tile.id} />
								{/await}
							{/if}
						</Tile>
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
		.container {
			height: 21.8rem;
		}
		.graph {
			width: 118px;
			height: 21.8rem;
		}
	}
	@media (max-width: 360px) {
		.container {
			height: 20rem;
			margin-bottom: 16px;
		}
		.graph {
			height: 20rem;
		}
	}
</style>
