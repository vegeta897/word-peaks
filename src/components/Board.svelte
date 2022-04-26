<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Graph from '$com/Graph.svelte'
	import * as store from '$src/store'
	import Tile from '$com/Tile.svelte'
	import { get } from 'svelte/store'
	import { trackEvent } from '$lib/plausible'
	import { animationSupported } from '$lib/transitions'
	import { ROWS, WORD_LENGTH } from '$lib/data-model'

	const { boardContent, currentRow, currentTile, gameFinished, showAllHints, newUser } = store

	let preloadedRows = get(store.guesses).length
	let ready = false
	let idle = false
	let canAnimate = null

	let idleTimeout
	let idleSessionID = 0

	async function waitForIdle() {
		if (canAnimate === false) return
		const thisIdleSessionID = ++idleSessionID
		clearTimeout(idleTimeout)
		if (get(gameFinished) && get(store.openScreen) === null && !document.hidden) {
			let thisTimeout: number
			await new Promise((resolve) => {
				idleTimeout = setTimeout(() => {
					resolve()
				}, 20 * 1000)
				thisTimeout = idleTimeout
			})
			if (thisIdleSessionID !== idleSessionID) return
			if (canAnimate === null) canAnimate = animationSupported()
			if (!canAnimate) return
			trackEvent('idleOnFinish')
			const scheduler = await import('$lib/idle-scheduler')
			scheduler.initScheduler((ROWS - get(currentRow)) * WORD_LENGTH)
			idle = true
		} else {
			idle = false
		}
	}

	gameFinished.subscribe(() => {
		if (ready) preloadedRows = 0
		waitForIdle()
	})
	store.answer.subscribe(() => waitForIdle())
	store.openScreen.subscribe(() => waitForIdle())

	let graphWidth: number
	let graphHeight: number

	onMount(() => {
		ready = true // Prevents SSR for board
		document.addEventListener('visibilitychange', () => waitForIdle())
	})
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
								{#await import('$com/Idler.svelte') then module}
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
			class:minimized={$newUser && $currentRow === 0}
			class:invisible={!$newUser && $currentRow === 0}
			bind:clientWidth={graphWidth}
			bind:clientHeight={graphHeight}
		>
			<Graph {graphWidth} {graphHeight} />
		</div>
	{:else}
		<div class="loading">loading...</div>
	{/if}
</div>

<style>
	.container {
		margin: 0 auto 6px;
		padding: 0 4px;
		height: 378px;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	.board {
		display: flex;
		flex-direction: column;
	}

	:root {
		--tile-row-margin-bottom: 6px;
	}

	.tile-row {
		margin-bottom: var(--tile-row-margin-bottom);
		display: flex;
	}

	.tile-row:last-child {
		margin-bottom: 0;
	}

	.graph {
		margin-left: 4px;
		width: 204px;
		height: 100%;
		transition: width 400ms ease-in-out, margin-left 400ms ease-in-out, opacity 200ms ease-out;
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
			height: 354px;
		}
		.graph {
			width: 118px;
		}
	}
	@media (max-width: 360px) {
		.container {
			height: 312px;
			margin-bottom: 4px;
		}
		:root {
			--tile-row-margin-bottom: 4px;
		}
	}
	@media (max-width: 330px) {
		.graph {
			display: none;
		}
	}
</style>
