<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { Landscape } from '$lib/landscape'
	import { getLandscape } from '$lib/landscape'
	import Tree from './landscape/Tree.svelte'
	import Hill from './landscape/Hill.svelte'
	import Pond from './landscape/Pond.svelte'

	// TODO: Add animations on touch and hover

	// TODO: Remember to test new-player UX

	// TODO: Support high-contrast color mode

	// TODO: Add share landscape image button - https://stackoverflow.com/a/76239811/2612679

	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0
	let seed = 0
	let animate = false
	let firstDraw = true

	let landscape: Landscape = {
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
		rowsGenerated: 0,
		features: [],
		tileMap: new Map(),
		openTiles: new Map(),
		pondTiles: [],
		newPondTiles: [],
		nextID: 1,
	}

	function updateDimensions(width: number, height: number) {
		// console.log(width)
		// This is a little too aggressive
		// TODO: Maybe reduce tree count and lake size at smaller widths
		// TODO: Make hills 2x2 too
		const tileWidth = width < 120 ? 12 : 24
		const tileHeight = width < 120 ? 8 : 16
		const newWidth = Math.floor(width / tileWidth)
		const newHeight = Math.floor(height / tileHeight)
		if (newWidth === landscape.width && newHeight === landscape.height) return
		landscape.width = newWidth
		landscape.height = newHeight
		landscape.centerX = Math.floor(newWidth / 2)
		landscape.centerY = Math.floor(newHeight / 2)
		// console.log('center', centerGrid)
		svgWidth = newWidth * tileWidth
		svgHeight = newHeight * tileHeight
		animate = false
		redraw++
		clearLandscape()
		updateLandscape()
	}

	function clearLandscape() {
		landscape.rowsGenerated = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
		landscape.pondTiles.length = 0
		landscape.newPondTiles.length = 0
		landscape.nextID = 1
	}

	function updateLandscape() {
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (!landscape.width) return
		// console.log('container', containerWidth, 'x', containerHeight)
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rowsGenerated > 0) clearLandscape()
			// landscape.features.push({
			// 	type: 'pond',
			// 	id: 1,
			// 	tiles: [
			// 		[1, 1],
			// 		[2, 1],
			// 		[3, 1],
			// 		[2, 2],
			// 		[2, 3],
			// 		[3, 3],
			// 		[4, 3],
			// 		[4, 2],
			// 		[4, 1],
			// 		[6, 3],
			// 		[6, 2],
			// 		[6, 1],
			// 	],
			// 	mergedTiles: [],
			// 	delay: 100,
			// })
			// landscape = landscape
			return
		} else if (firstDraw || landscape.rowsGenerated > 0) {
			firstDraw = false
			animate = true
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow,
			`${seed}`
		)
	}

	$: if (containerWidth && containerHeight)
		updateDimensions(containerWidth, containerHeight)

	store.currentRow.subscribe((currentRow) => {
		if (currentRow === 0) firstDraw = true
		updateLandscape()
	})

	type FlashColorHandler = (x: number, y: number, duration: number) => void
	const featureComponents: {
		flashColor: FlashColorHandler
	}[] = []
	let pondComponent: {
		flashColor: FlashColorHandler
	}

	function updateMousePosition({
		offsetX,
		offsetY,
	}: {
		offsetX: number
		offsetY: number
	}) {
		mouseX = -0.1 + (offsetX / svgWidth) * (landscape.width * 1.5 + 0.2)
		mouseY = -0.1 + (offsetY / svgHeight) * (landscape.height + 0.2)
	}

	let lastFlashAt = 0
	let flashDurationExtra = 0

	const flashColors: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		updateMousePosition(event)
		const now = Date.now()
		// This is brilliant
		flashDurationExtra = Math.max(
			0,
			Math.min(3500, flashDurationExtra + lastFlashAt + 250 - now)
		)
		const duration = 2000 + flashDurationExtra
		featureComponents.forEach((f) => f?.flashColor(mouseX, mouseY, duration))
		pondComponent.flashColor(mouseX, mouseY, duration)
		lastFlashAt = now
	}

	let mouseOver = false
	let mouseX: number
	let mouseY: number

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return
		mouseOver = true
		updateMousePosition(event)
		// console.log(mouseX, mouseY)
	}
	function onMouseLeave() {
		mouseOver = false
	}
	let redraw = 0
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		viewBox="-0.1 -0.1 {landscape.width * 1.5 + 0.2} {landscape.height + 0.2}"
		on:pointerdown={flashColors}
		on:pointermove={onPointerMove}
		on:mouseleave={onMouseLeave}
	>
		{#key `${seed}${redraw}`}
			<Pond
				bind:this={pondComponent}
				tiles={landscape.pondTiles}
				newTiles={landscape.newPondTiles}
				{animate}
				{mouseOver}
				{mouseX}
				{mouseY}
				landscapeWidth={landscape.width}
				landscapeHeight={landscape.height}
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
						bind:this={featureComponents[f]}
					/>
				{:else}
					<Hill
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
						bind:this={featureComponents[f]}
					/>
				{/if}
			{/each}
		{/key}
	</svg>
</div>
<p style="position: absolute; top: 30px; font-size: 0.75rem;">
	seed: {seed} time: {landscape.generationTime?.toFixed(1)}ms
</p>
<button
	on:click={() => {
		seed++
		clearLandscape()
		updateLandscape()
	}}
	style="position: absolute; top: 50px; right: 10px;">seed</button
>

<style>
	div {
		height: calc(100% + 8px);
		margin-top: -8px;
		overflow: clip;
	}
	svg {
		position: absolute;
		top: 0;
		left: 0;
		touch-action: manipulation;
	}
</style>
