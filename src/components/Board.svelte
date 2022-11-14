<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Peaks from '$com/Peaks.svelte'
	import * as store from '$src/store'
	import Tile from '$com/Tile.svelte'
	import { get } from 'svelte/store'
	import { trackEvent } from '$lib/plausible'
	import { animationSupported } from '$lib/transitions'
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import { browser } from '$app/env'

	const { boardContent, currentRow, currentTile, gameFinished, showAllHints, newUser } = store

	let preloadedRows = get(store.guesses).length
	let idle = false
	let canAnimate: boolean | null = null

	let idleTimeout: NodeJS.Timer | undefined
	let idleSessionID = 0

	async function waitForIdle() {
		if (!get(store.allowDancing)) return
		if (canAnimate === false) return
		idle = false
		const thisIdleSessionID = ++idleSessionID
		clearTimeout(idleTimeout!)
		if (get(store.openScreen) === null && !document.hidden) {
			await new Promise<void>((resolve) => {
				idleTimeout = setTimeout(() => {
					resolve()
				}, (get(gameFinished) ? 20 : 30) * 1000)
			})
			if (thisIdleSessionID !== idleSessionID) return
			if (canAnimate === null) canAnimate = animationSupported()
			if (!canAnimate) return
			trackEvent(get(gameFinished) ? 'idleOnFinish' : 'idleBeforeFinish')
			const scheduler = await import('$lib/idle-scheduler')
			scheduler.initScheduler((ROWS - get(currentRow)) * WORD_LENGTH)
			idle = true
		}
	}

	onMount(() => {
		gameFinished.subscribe(() => {
			preloadedRows = 0
			waitForIdle()
		})
		document.addEventListener('visibilitychange', () => waitForIdle())
		store.openScreen.subscribe(() => waitForIdle())
		store.boardContent.subscribe(() => waitForIdle())
		store.currentTile.subscribe(() => waitForIdle())
	})
	onDestroy(() => {
		clearTimeout(idleTimeout!)
		idleTimeout = undefined
	})
</script>

<div class="container">
	{#if browser}
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
							{#if idle && tile.letter === '' && r > $currentRow}
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
		>
			<Peaks />
		</div>
	{:else}
		<div class="loading">loading...</div>
	{/if}
</div>

<style>
	.container {
		margin: 0 auto 12px;
		padding: 0 4px;
		height: 372px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.board {
		display: flex;
		flex-direction: column;
	}

	.tile-row {
		margin-bottom: 6px;
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
		color: #aaa;
		font-size: 1.3em;
		background: linear-gradient(to left, #aaa1, #aaa3 20%, #aaa, #aaa3 80%, #aaa1);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: glimmer 3s linear infinite;
		background-size: 200%;
	}
	@keyframes glimmer {
		to {
			background-position: 200% center;
		}
	}

	@media (max-width: 480px) {
		.container {
			height: 348px;
		}
		.graph {
			width: 118px;
		}
	}
	@media (max-width: 360px) {
		.container {
			height: 308px;
		}
		.tile-row {
			margin-bottom: 4px;
		}
	}
</style>
