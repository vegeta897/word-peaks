<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import { initLandscape, clearLandscape, getLandscape } from '$lib/landscape/landscape'
	import Tree from './Tree.svelte'
	import Hill from './Hill.svelte'
	import Pond from './Pond.svelte'
	import { getDistance, type XY } from '$lib/math'
	import { dev } from '$app/env'
	import PondRow from './PondRow.svelte'
	import FunSummary from './FunSummary.svelte'
	import { funState, initFunState, clearFunState } from '$lib/landscape/fun'
	import PondLilyPads from './PondLilyPads.svelte'

	// Pie in the sky idea:
	// Split the grid into actual 3d orthographic (bevelled?) tiles
	// Maybe user can shuffle them around

	const { landscapeFunMode, funStats, answer, landscapeWideView, landscapeComponents } =
		store

	let initializing = true
	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0
	let hide = false
	let animate = false
	let firstDraw = true
	let redraw = 0

	let landscape = initLandscape()
	let pondRowComponents: PondRow[] = []

	const IDEAL_TILE_COUNT = 240
	const IDEAL_TILE_COUNT_MINI = 170

	function updateDimensions(width: number, height: number) {
		const ratio = height / (width / 1.5)
		let tileHeight = height / Math.sqrt(IDEAL_TILE_COUNT * ratio) // Yay math
		landscape.mini = false
		if (tileHeight < 12) {
			tileHeight = height / Math.sqrt(IDEAL_TILE_COUNT_MINI * ratio)
			landscape.mini = true
		}
		const tileWidth = tileHeight * 1.5
		const newWidth = Math.floor(width / tileWidth)
		const newHeight = Math.floor(height / tileHeight)
		svgWidth = Math.ceil(newWidth * tileWidth)
		svgHeight = Math.ceil(newHeight * tileHeight)
		if (newWidth === landscape.width && newHeight === landscape.height) return
		landscape.width = newWidth
		landscape.height = newHeight
		landscape.centerX = Math.floor(newWidth / 2)
		landscape.centerY = Math.floor(newHeight / 2)
		animate = false
		redraw++
		clearLandscape(landscape)
		updateLandscape()
	}

	function updateLandscape() {
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (initializing || !landscape.width) return
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rowsGenerated > 0) {
				clearLandscape(landscape)
			}
			return
		}
		if (firstDraw || landscape.rowsGenerated > 0) {
			firstDraw = false
			animate = !get(store.reduceMotion)
		}
		const redrawMode = get(store.landscapeRedraw)
		if (redrawMode) {
			animate = redrawMode === 'animate' && !get(store.reduceMotion)
			store.landscapeRedraw.set(null)
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow,
			get(store.landscapeWideView)
		)
		store.landscape.set(landscape)
		store.leafCount.set(0)
		if (get(landscapeWideView)) initFunState(landscape, get(store.answer))
		else clearFunState()
		lastFlashXY = null
		hide = false
	}

	$: if (containerWidth && containerHeight)
		updateDimensions(containerWidth, containerHeight)

	store.landscapeNewGame.subscribe((newGame) => {
		if (!newGame) return
		initializing = false
		store.landscapeNewGame.set(false)
		firstDraw = true
		redraw++
		clearLandscape(landscape)
		// Skip update if landscapeWideView is true, because it is about to change
		if (!get(store.landscapeWideView)) updateLandscape()
	})
	store.landscapeNewRow.subscribe((newRow) => {
		if (!newRow) return
		store.landscapeNewRow.set(false)
		updateLandscape()
	})
	store.landscapeRedraw.subscribe((redrawType) => {
		if (redrawType === null) return
		redraw++
		clearLandscape(landscape)
		updateLandscape()
	})
	// Hide landscape until it updates to avoid flashing on FF
	store.landscapeWideView.subscribe(() => (hide = true))

	$: treeComponents = $landscapeComponents.features.filter(
		(c) => c?.featureType === 'tree'
	)
	$: hillComponents = $landscapeComponents.features.filter(
		(c) => c?.featureType === 'hill'
	)

	function updateMousePosition(offsetX: number, offsetY: number) {
		mouseX = -1 + (offsetX / svgWidth) * (landscape.width * 15 + 2)
		mouseY = -1 + (offsetY / svgHeight) * (landscape.height * 10 + 2)
	}

	let lastFlashAt = 0
	let flashDurationExtra = 0
	let lastFlashXY: null | XY = null
	$: landscapeSpan = getDistance(landscape.width + 3, landscape.height + 3)

	// TODO: Hint fun mode buttons when clicking in full view

	// TODO: When exiting full view after making any changes, show cropped version
	// with overlay buttons to "resume" or "reset"

	// TODO: Persist gems and pop/pluck/sop stats, share-able, add to stats screen

	// TODO: Gems only appear when you clear the landscape a certain way, like a puzzle game

	// TODO: Omni-tool that can perform all 3 fun modes at once

	// TODO: Progress bars for clearing landscape feature on each corresponding fun mode button
	// Global counts too?
	// Get your stickers for the day, one for each feature

	// TODO: Hidden gem under one random tile per day, hill tree or pond
	// TODO: Gem is buried and poking out after feature is removed, click to dig up

	// TODO: Do the randomly hidden gem idea! Don't make people clear the landscape
	// Unless they want to! Show fun stats when gem acquired, but user can close it

	// TODO: Use sparkles near funned features that are close to gem

	// TODO: "Find today's gem!" Store counts used to find gem, and total counts
	// Lower counts to gems ratio is favorable

	// TODO: Fun size slider/buttons, to allow players to be more precise

	let mouseOver = false
	let dragging = false
	let gestureId = 0
	let mouseX: number
	let mouseY: number

	const onSVGPointerMove: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		mouseOver = true // OK to redundantly assign, doesn't re-trigger reactivity
		updateMousePosition(event.offsetX, event.offsetY)
		// Ignore dragging from outside of landscape
		if (!dragging && event.buttons > 0) return
		dragging = event.buttons === 1
		if (!dragging) return
		event.preventDefault()
		interact('dragging')
	}
	const onPointerDown: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		dragging = true
		gestureId++ // Distinguish gestures
		event.preventDefault()
		updateMousePosition(event.offsetX, event.offsetY)
		interact()
	}
	const onPointerUp: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		dragging = false
		event.preventDefault()
		updateMousePosition(event.offsetX, event.offsetY)
		interact('pointerUp')
	}
	const onPointerLeave: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		dragging = event.buttons === 1
		mouseOver = false
		interact('pointerUp')
	}

	const interact = (mode?: 'dragging' | 'pointerUp') => {
		// const fun = get(funStatus)
		// if (fun.gem?.status === 'collected') return
		// if (fun.gem?.status === 'found') {
		// 	// Don't collect if dragging or pointerUp
		// 	if (mode === 'dragging' || mode === 'pointerUp') return
		// 	const gem = fun.gem
		// 	const collected = gem.component?.collect(mouseX, mouseY)
		// 	if (!collected) return
		// 	let maxFillTime = 0
		// 	const components = get(landscapeComponents)
		// 	maxFillTime = components.pond?.fillIn(...gem.xy) || 0
		// 	components.features.forEach((f) => {
		// 		const fillTime = f.fillIn(...gem.xy)
		// 		if (fillTime > maxFillTime) maxFillTime = fillTime
		// 	})
		// 	gem.status = 'collected'
		// 	fun.resultDelay = maxFillTime
		// 	return
		// }

		// TODO: Consider simplifying the hit detection to grid-based
		// Can use some y-offset grids to account for tree and hill height

		if ($landscapeFunMode === null) {
			if (mode === 'dragging' || mode === 'pointerUp') return
			if (get(store.reduceMotion)) return
			const now = Date.now()
			// This is brilliant
			flashDurationExtra = Math.max(
				0,
				Math.min(3500, flashDurationExtra + lastFlashAt + 250 - now)
			)
			// Don't flash color in wide view, too complex to handle fun elements
			const duration = get(landscapeWideView)
				? 0
				: landscapeSpan * 70 + flashDurationExtra
			const components = get(landscapeComponents)
			components.features.forEach((f) => f?.flashColor(mouseX, mouseY, duration))
			components.pond?.flashColor(mouseX, mouseY, duration)
			lastFlashAt = now
			lastFlashXY = [mouseX, mouseY]
			return
		}
		// TODO: Use different flash effect in fun modes (???)
		let maxFunTime = 0
		let funCounts = 0
		const components = get(landscapeComponents)
		if ($landscapeFunMode === 'sop') {
			if (mode === 'pointerUp') return
			const sopResult = components.pond?.doFun(mouseX, mouseY, mode === 'dragging')
			if (sopResult?.brokenTiles) {
				funCounts += sopResult.brokenTiles
			}
		} else {
			if ($landscapeFunMode === 'pluck') {
				const interaction = {
					gestureId,
					touch: svgWidth < 450, // TODO: Make a size switch near fun buttons, default based on landscape size
					dragging,
					pointerUp: mode === 'pointerUp',
				}
				// TODO: No longer need maxFunTime
				treeComponents.forEach((f) => {
					const treePluck = f.doFun(mouseX, mouseY, interaction)
					if (typeof treePluck === 'number') {
						funCounts++
						if (treePluck > maxFunTime) maxFunTime = treePluck
					}
				})
			} else if (mode !== 'pointerUp') {
				hillComponents.forEach((f) => {
					const hillPop = f.doFun(mouseX, mouseY)
					if (typeof hillPop === 'number') {
						funCounts++
						if (hillPop > maxFunTime) maxFunTime = hillPop
					}
				})
			}
		}
		if (funCounts === 0) return // No fun was had
		funStats.update((fs) => {
			fs.counts[$landscapeFunMode] += funCounts
			return fs
		})
		// const allPlucked = treeComponents.every((f) => f.funStatus?.done)
		// const allPopped = hillComponents.every((f) => f.funStatus.done)
		// const allSopped =
		// 	components.pond?.funStatus.status === 'done' || landscape.pondTiles.length === 0
		// if (allPlucked && allPopped && allSopped) {
		// 	// TODO: Cleaned
		// }
	}
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<!-- Viewbox scaled by 10 to avoid FF's crappy rasterization in some places -->
	{#if dev && !$landscapeWideView}{$answer}{/if}
	<svg
		style:display={hide ? 'none' : 'block'}
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		style:left="{Math.floor((containerWidth - svgWidth) / 2)}px"
		viewBox="-1 -1 {landscape.width * 1.5 * 10 + 2} {landscape.height * 10 + 2}"
		on:pointerdown={onPointerDown}
		on:pointerup={onPointerUp}
		on:pointermove={onSVGPointerMove}
		on:pointerleave={onPointerLeave}
		on:touchend|preventDefault
		style:touch-action={$landscapeFunMode ? 'none' : 'manipulation'}
	>
		{#key redraw}
			<Pond
				bind:this={$landscapeComponents.pond}
				tiles={landscape.pondTiles}
				newTiles={landscape.newPondTiles}
				{animate}
				delay={landscape.pondDelay || 0}
				landscapeWidth={landscape.width}
				landscapeHeight={landscape.height}
				mini={landscape.mini}
				spawnIceShards={(y, shardSection) =>
					pondRowComponents[y].addShardSection(shardSection)}
			/>
			<PondLilyPads />
			{#each landscape.featureRows as row, y}
				{#each row.features as feature (feature.id)}
					{#if feature.type === 'tree'}
						<Tree
							id={feature.id}
							x={feature.x}
							y={feature.y}
							xJitter={feature.xJitter}
							yJitter={feature.yJitter}
							size={feature.size}
							{animate}
							delay={feature.delay}
							{mouseOver}
							{mouseX}
							{mouseY}
							pluckMode={$landscapeFunMode === 'pluck'}
							bind:this={$landscapeComponents.features[feature.id]}
						/>
					{:else}
						<Hill
							id={feature.id}
							x={feature.x}
							y={feature.y}
							xJitter={feature.xJitter}
							yJitter={feature.yJitter}
							size={feature.size}
							mini={landscape.mini}
							{animate}
							delay={feature.delay}
							{mouseOver}
							{mouseX}
							{mouseY}
							popMode={$landscapeFunMode === 'pop'}
							bind:this={$landscapeComponents.features[feature.id]}
						/>
					{/if}
				{/each}
				{#if row.pond}
					<PondRow bind:this={pondRowComponents[y]} />
				{/if}
			{/each}
		{/key}
		{#if lastFlashXY}
			{@const [cx, cy] = lastFlashXY}
			{#key lastFlashAt}
				<ellipse
					{cx}
					{cy}
					style:transform-origin="{cx}px {cy}px"
					rx="15"
					ry="10"
					fill="#fff7"
					class="flash"
				/>
			{/key}
		{/if}
	</svg>
	{#if false}
		<FunSummary />
	{/if}
</div>

<style>
	div {
		height: 100%;
		position: relative;
		-webkit-user-select: none;
		user-select: none;
	}
	svg {
		position: absolute;
		bottom: 0;
		overflow: visible;
		/* touch-action: manipulation; Allow panning and pinch zooming */
		/* touch-action: none; */
		/* background: #0f21; */
	}
	svg :global(*) {
		pointer-events: none;
	}
	.flash {
		animation: flash_out 250ms forwards cubic-bezier(0.61, 1, 0.88, 1);
	}

	@keyframes flash_out {
		from {
			transform: scale(0);
		}
		to {
			opacity: 0;
		}
	}
</style>
