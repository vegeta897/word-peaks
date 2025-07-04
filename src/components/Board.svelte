<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte'
	import Landscape from '$src/components/landscape/Landscape.svelte'
	import * as store from '$src/store'
	import Tile from '$com/Tile.svelte'
	import { get } from 'svelte/store'
	import { trackEvent } from '$lib/plausible'
	import { animationSupported } from '$lib/transitions'
	import { ROWS, WORD_LENGTH } from '$lib/constants'
	import { browser } from '$app/environment'
	import { fade } from 'svelte/transition'
	import LastGameDetail from './LastGameDetail.svelte'
	import { cubicOut } from 'svelte/easing'
	import { aprilFools } from '$lib/share'
	import Worm from './Worm.svelte'
	import { pauseTimer, resumeTimer } from '$src/lib/stats'

	const {
		boardContent,
		currentRow,
		currentTile,
		gameFinished,
		showAllHints,
		guesses,
		lastGameDetail,
		landscapeWideView,
		showEndView,
		gameMode,
		hideLandscape,
		answer,
	} = store

	let initialized = false
	let idle = false
	let canAnimate: boolean | null = null
	let idleTimeout: number | undefined
	let idleSessionID = 0

	async function waitForIdle() {
		if (!get(store.allowDancing)) return
		if (canAnimate === false) return
		idle = false
		danceClickProgress = 0
		const thisIdleSessionID = ++idleSessionID
		clearTimeout(idleTimeout!)
		if (!get(gameFinished) && get(store.openScreen) === null && !document.hidden) {
			await new Promise<void>((resolve) => {
				idleTimeout = setTimeout(() => {
					resolve()
				}, 30 * 1000)
			})
			if (thisIdleSessionID !== idleSessionID) return
			if (canAnimate === null) canAnimate = animationSupported()
			if (!canAnimate) return
			trackEvent('idleBeforeFinish')
			const scheduler = await import('$lib/idle-scheduler')
			scheduler.initScheduler((ROWS - get(currentRow)) * WORD_LENGTH)
			idle = true
		}
	}

	onMount(() => {
		document.addEventListener('visibilitychange', () => {
			waitForIdle()
			if (!get(gameFinished)) {
				if (document.hidden) {
					pauseTimer()
				} else {
					resumeTimer()
				}
			}
		})
		store.openScreen.subscribe(() => waitForIdle())
		store.boardContent.subscribe(() => waitForIdle())
		store.currentTile.subscribe(() => waitForIdle())
		initialized = true
	})
	onDestroy(() => {
		clearTimeout(idleTimeout!)
		idleTimeout = undefined
	})

	let danceClickProgress = 0

	async function danceClick(t: number) {
		// TODO: Make all tiles start with a synchronized dance
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

	// Using answer as a dependency so this will refresh when the next word starts
	$: isAprilFools = $answer && aprilFools()
</script>

<div class="container" style="--row-count: {ROWS}">
	{#if browser && initialized}
		{#if !$landscapeWideView}
			<div class="board">
				{#if !$gameFinished || !$lastGameDetail || !$showEndView}
					<div
						class="tile-row-container"
						transition:fade={{ duration: 250, easing: cubicOut }}
					>
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
											<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
											<div
												class="dance-tile"
												style:opacity={danceClickProgress / 5 || 1}
												on:click={() => danceClick(t)}
												out:fade|global={{ duration: 500 }}
											>
												{'DANCE'.substring(0, danceClickProgress)[t] || ''}
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
						{#if isAprilFools}
							<Worm />
						{/if}
					</div>
				{:else}
					{#key $gameMode}
						<LastGameDetail lastGameDetail={$lastGameDetail} />
					{/key}
				{/if}
			</div>
		{/if}
		{#if !$hideLandscape}
			<div class="landscape" style:padding-top={$landscapeWideView ? '20px' : 0}>
				<Landscape />
			</div>
		{/if}
	{:else}
		<div class="loading">loading...</div>
	{/if}
</div>

<style>
	:root {
		--tile-margin: 5px;
		--tile-size: 70px;
		--tile-font-size: 2.5rem;
		--board-width: calc(5 * var(--tile-size) + 4 * var(--tile-margin));
	}

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
		margin-right: 4px;
		height: 100%;
		width: var(--board-width);
		position: relative;
	}

	.tile-row-container {
		position: absolute;
		top: 0;
		left: 0;
	}

	.tile-row {
		margin-bottom: var(--tile-margin);
		display: flex;
	}

	.tile-row:last-child {
		margin-bottom: 0;
	}

	.landscape {
		flex-grow: 1;
		height: 100%;
		box-sizing: border-box;
	}

	.loading {
		display: flex;
		height: 100%;
		align-items: center;
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
			--tile-margin: 3px;
		}
	}
	@media (max-width: 430px) {
		:root {
			--tile-size: 48px;
		}
	}
	@media (max-width: 390px) {
		:root {
			--tile-size: 44px;
			--tile-font-size: 1.9rem;
		}
	}
	@media (max-width: 375px) {
		:root {
			--tile-size: 42px;
			--tile-margin: 2px;
			--tile-font-size: 1.8rem;
		}
		.container {
			margin-bottom: 4px;
		}
	}
	@media (max-width: 340px) {
		.landscape {
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
