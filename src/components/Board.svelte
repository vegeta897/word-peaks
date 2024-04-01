<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte'
	import Landscape from '$com/Landscape.svelte'
	import * as store from '$src/store'
	import Tile from '$com/Tile.svelte'
	import { get } from 'svelte/store'
	import { trackEvent } from '$lib/plausible'
	import { animationSupported } from '$lib/transitions'
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import { browser } from '$app/env'
	import { fade } from 'svelte/transition'
	import { sleep } from '$lib/math'

	const { boardContent, currentRow, currentTile, gameFinished, showAllHints, guesses } =
		store

	let idle = false
	let canAnimate: boolean | null = null

	let idleTimeout: NodeJS.Timer | undefined
	let idleSessionID = 0

	async function waitForIdle() {
		if (!get(store.allowDancing)) return
		if (canAnimate === false) return
		idle = false
		danceClickProgress = 0
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

	let landscapeComponent: { getDrawTime: () => number }

	async function onFinish() {
		await tick() // Let landscape generate
		await sleep(landscapeComponent?.getDrawTime() || 2000)
		store.openScreen.set('results')
	}

	onMount(() => {
		gameFinished.subscribe((finished) => {
			if (finished) onFinish()
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

	let danceClickProgress = 0

	async function danceClick(t: number) {
		if (!get(store.allowDancing)) return
		if (canAnimate === null) canAnimate = animationSupported()
		if (!canAnimate) return
		if (danceClickProgress === t) {
			danceClickProgress++
			if (danceClickProgress === WORD_LENGTH) {
				trackEvent('danceClick')
				clearTimeout(idleTimeout!)
				await tick()
				const scheduler = await import('$lib/idle-scheduler')
				scheduler.initScheduler(5 * WORD_LENGTH, true)
				idle = true
			}
		} else {
			danceClickProgress = 0
		}
	}
</script>

<div class="container" style="--row-count: {ROWS}">
	{#if browser}
		<div class="board">
			{#each $boardContent as boardRow, r}
				<div class="tile-row">
					{#each boardRow as tile, t (r + '.' + t)}
						<Tile
							{tile}
							current={r === $currentRow && t === $currentTile}
							inCurrentRow={!$gameFinished && r === $currentRow}
							showHint={!$gameFinished && (t === $currentTile || $showAllHints)}
						>
							{#if !idle && !$guesses[0] && r === ROWS - 1}
								<div
									class="dance-tile"
									style:opacity={((t < danceClickProgress ? 1 : 0) * danceClickProgress) /
										5}
									on:click={() => danceClick(t)}
									out:fade={{ duration: 500 }}
								>
									{'DANCE'[t]}
								</div>
							{/if}
							{#if idle && tile.letter === '' && r > $currentRow}
								{#await import('$com/Idler.svelte') then module}
									<svelte:component this={module.default} id={r + ':' + t} />
								{/await}
							{/if}
						</Tile>
					{/each}
				</div>
			{/each}
		</div>
		<div class="graph"><Landscape bind:this={landscapeComponent} /></div>
	{:else}
		<div class="loading">loading...</div>
	{/if}
</div>

<style>
	.container {
		margin: 0 auto 6px;
		padding: 0 4px;
		height: calc(var(--row-count) * (var(--tile-size) + var(--tile-margin)));
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	.board {
		display: flex;
		flex-direction: column;
	}

	:root {
		--tile-margin: 5px;
		--tile-size: 70px;
		--tile-font-size: 2.5rem;
	}

	.tile-row {
		margin-bottom: var(--tile-margin);
		display: flex;
	}

	.tile-row:last-child {
		margin-bottom: 0;
	}

	.graph {
		margin-left: 4px;
		flex-grow: 1;
		height: 100%;
	}

	.loading {
		color: #aaa;
		font-size: 1.3em;
		background: linear-gradient(to left, #aaa1, #aaa3 20%, #aaa, #aaa3 80%, #aaa1);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: glimmer 3s linear infinite;
		background-size: 200%;
	}
	@keyframes glimmer {
		to {
			background-position: 200% center;
		}
	}

	@media (max-width: 720px) {
		:root {
			--tile-size: 64px;
			--tile-margin: 4px;
		}
	}
	@media (max-width: 640px) {
		:root {
			--tile-size: 58px;
			--tile-font-size: 2rem;
		}
	}
	@media (max-width: 560px) {
		:root {
			--tile-size: 54px;
		}
	}
	@media (max-width: 480px) {
		:root {
			--tile-size: 50px;
		}
	}
	@media (max-width: 420px) {
		:root {
			--tile-size: 46px;
		}
	}
	@media (max-width: 360px) {
		:root {
			--tile-size: 42px;
			--tile-font-size: 1.8rem;
		}
		.container {
			margin-bottom: 4px;
		}
	}
	@media (max-width: 340px) {
		.graph {
			display: none;
		}
	}

	.dance-tile {
		font-size: var(--tile-font-size);
		line-height: var(--tile-font-size);
		font-weight: 700;
		color: #5b505e;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		user-select: none;
		position: absolute;
	}
</style>
