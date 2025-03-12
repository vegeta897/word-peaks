<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { LandscapeFunMode } from '$lib/landscape/landscape'
	import { initLandscape, clearLandscape, getLandscape } from '$lib/landscape/landscape'
	import Tree from './Tree.svelte'
	import Hill from './Hill.svelte'
	import Pond from './Pond.svelte'
	import { getDistance, sleep, type XY } from '$lib/math'
	import { dev } from '$app/env'

	const { landscapeForceColor, landscapeFunMode, funStats, answer } = store

	let initializing = true
	let svgElement: SVGElement
	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0
	let hide = false
	let animate = false
	let firstDraw = true
	let redraw = 0

	let landscape = initLandscape()

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
			if (landscape.rowsGenerated > 0) clearLandscape(landscape)
			return
		}
		if (firstDraw || landscape.rowsGenerated > 0) {
			firstDraw = false
			animate = true
		}
		const redrawMode = get(store.landscapeRedraw)
		if (redrawMode) {
			animate = redrawMode === 'animate'
			store.landscapeRedraw.set(null)
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow
		)
		store.landscape.set(landscape)
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

	type FlashColorHandler = (x: number, y: number, duration: number) => void
	const featureComponents: {
		flashColor: FlashColorHandler
		doFun: (x: number, y: number) => void | number
		featureType: 'tree' | 'hill'
	}[] = []
	let pondComponent: {
		flashColor: FlashColorHandler
		doFun: (x: number, y: number) => void
	}

	function updateMousePosition(offsetX: number, offsetY: number) {
		mouseX = -1 + (offsetX / svgWidth) * (landscape.width * 1.5 * 10 + 2)
		mouseY = -1 + (offsetY / svgHeight) * (landscape.height * 10 + 2)
	}

	let lastFlashAt = 0
	let flashDurationExtra = 0
	let lastFlashXY: null | XY = null
	$: landscapeSpan = getDistance(landscape.width + 3, landscape.height + 3)

	// TODO: Hint fun mode buttons when clicking in full view

	// TODO: When exiting full view after making any changes, show cropped version
	// with overlay buttons to "resume" or "reset"

	// TODO: Allow click and drag, check line segment intersects for trees and ponds

	// TODO: Idle game?

	// TODO: Persist gems and pop/pluck/sop stats, share-able, add to stats screen

	// TODO: Gems only appear when you clear the landscape a certain way, like a puzzle game

	// TODO: Omni-tool that can perform all 3 fun modes at once

	// TODO: Progress bars for clearing landscape feature on each corresponding fun mode button
	// Get your stickers for the day, one for each feature

	// TODO: Hidden gem under one random tile per day, hill tree or pond
	// TODO: Gem is buried and poking out after feature is removed, click to dig up

	const onPointerDown: svelte.JSX.PointerEventHandler<SVGElement> = async (event) => {
		// TODO: Handle multi touch
		if (event.pointerType === 'mouse' && event.button !== 0) return
		event.preventDefault()
		updateMousePosition(event.offsetX, event.offsetY)
		const funMode = get(landscapeFunMode)
		if (funMode === null) {
			const now = Date.now()
			// This is brilliant
			flashDurationExtra = Math.max(
				0,
				Math.min(3500, flashDurationExtra + lastFlashAt + 250 - now)
			)
			const duration = landscapeSpan * 70 + flashDurationExtra
			featureComponents.forEach((f) => f?.flashColor(mouseX, mouseY, duration))
			pondComponent.flashColor(mouseX, mouseY, duration)
			lastFlashAt = now
			lastFlashXY = [mouseX, mouseY]
			// TODO: Use different flash effect in fun modes
		} else {
			// TODO: Increase hit zone for mobile taps?
			if (funMode === 'sop') {
				pondComponent.doFun(mouseX, mouseY)
				return
			} else {
				const delayedFun: Promise<LandscapeFunMode>[] = []
				featureComponents.forEach((f) => {
					if (!f) return
					const treeFun = f.featureType === 'tree' && funMode === 'pluck'
					const hillFun = f.featureType === 'hill' && funMode === 'pop'
					if (!treeFun && !hillFun) return
					const funResult = f.doFun(mouseX, mouseY)
					if (typeof funResult === 'number') {
						delayedFun.push(sleep(funResult).then(() => funMode))
					}
				})
				Promise.all(delayedFun).then((funModes) => {
					funStats.update((fs) => {
						for (const funMode of funModes) {
							fs.counts[funMode]++
						}
						return fs
					})
				})
			}
		}
	}

	let mouseOver = false
	let mouseX: number
	let mouseY: number

	const onSVGPointerMove: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		mouseOver = true // OK to redundantly assign, doesn't re-trigger reactivity
		// TODO: Use event.buttons for dragging fun-mode
		updateMousePosition(event.offsetX, event.offsetY)
	}
	const onMouseLeave = () => (mouseOver = false)

	$: if (svgElement) store.landscapeSVG.set(svgElement)
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<!-- Viewbox scaled by 10 to avoid FF's crappy rasterization in some places -->
	{#if dev}{$answer}{/if}
	<svg
		style:display={hide ? 'none' : 'block'}
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		style:left="{Math.floor((containerWidth - svgWidth) / 2)}px"
		viewBox="-1 -1 {landscape.width * 1.5 * 10 + 2} {landscape.height * 10 + 2}"
		on:pointerdown={onPointerDown}
		on:pointermove={onSVGPointerMove}
		on:mouseleave={onMouseLeave}
		on:touchend|preventDefault
		bind:this={svgElement}
	>
		{#key redraw}
			<Pond
				bind:this={pondComponent}
				tiles={landscape.pondTiles}
				newTiles={landscape.newPondTiles}
				{animate}
				delay={landscape.pondDelay || 0}
				landscapeWidth={landscape.width}
				landscapeHeight={landscape.height}
				mini={landscape.mini}
				forceColor={$landscapeForceColor}
				answer={$answer}
			/>
			{#each landscape.features as feature, f (feature.id)}
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
						forceColor={$landscapeForceColor}
						pluckMode={$landscapeFunMode === 'pluck'}
						bind:this={featureComponents[f]}
					/>
				{:else if feature.type === 'hill'}
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
						forceColor={$landscapeForceColor}
						popMode={$landscapeFunMode === 'pop'}
						bind:this={featureComponents[f]}
					/>
				{:else}
					<!-- <rect
						fill="#f001"
						y={feature.y * 10 + 1}
						height="8"
						width={landscape.width * 15}
					/> -->
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
		touch-action: manipulation; /* Allow panning and pinch zooming */
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
