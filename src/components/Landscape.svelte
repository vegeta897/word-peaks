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

	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0

	let landscape: Landscape = {
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
		rowsGenerated: 0,
		features: [],
		tileMap: new Map(),
		openTiles: new Map(),
		nextPondID: 1,
		totalDelay: 0,
	}

	function updateDimensions(width: number, height: number) {
		// console.log(width)
		// This is a little too aggressive
		// TODO: Maybe reduce tree count and lake size at smaller widths
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
		clearLandscape()
		updateLandscape()
	}

	function clearLandscape() {
		landscape.rowsGenerated = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
		landscape.nextPondID = 1
		landscape.totalDelay = 0
	}

	function updateLandscape() {
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (!landscape.width) return
		// console.log('container', containerWidth, 'x', containerHeight)
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rowsGenerated > 0) clearLandscape()
			return
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow,
			`${seed}`
		)
		// landscape.features.push({
		// 	type: 'pond',
		// 	pondID: 1,
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
		// 	],
		// })
	}
	$: if (containerWidth && containerHeight)
		updateDimensions(containerWidth, containerHeight)
	store.currentRow.subscribe(() => updateLandscape())
	let seed = 0
	const featureComponents: { redraw: () => void }[] = []

	function redrawFeatures() {
		featureComponents.forEach((f) => f?.redraw())
	}

	let mouse = false
	let mouseX: number
	let mouseY: number

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return
		mouse = true
		mouseX = -0.1 + (event.offsetX / svgWidth) * (landscape.width * 1.5 + 0.2)
		mouseY = -0.1 + (event.offsetY / svgHeight) * (landscape.height + 0.2)
		// console.log(mouseX, mouseY)
	}
	function onMouseLeave() {
		mouse = false
	}
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		viewBox="-0.1 -0.1 {landscape.width * 1.5 + 0.2} {landscape.height + 0.2}"
		on:click={redrawFeatures}
		on:pointermove={onPointerMove}
		on:mouseleave={onMouseLeave}
	>
		{#key seed}
			{#each landscape.features as feature, f}
				{#if feature.type === 'tree'}
					<Tree
						id={f}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						delay={feature.delay}
						{mouse}
						{mouseX}
						{mouseY}
						bind:this={featureComponents[f]}
					/>
				{:else if feature.type === 'hill'}
					<Hill
						id={f}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						delay={feature.delay}
						{mouse}
						{mouseX}
						{mouseY}
						bind:this={featureComponents[f]}
					/>
				{:else}
					<Pond
						id={f}
						tiles={feature.tiles}
						delay={feature.delay}
						{mouse}
						{mouseX}
						{mouseY}
						bind:this={featureComponents[f]}
					/>
				{/if}
			{/each}
		{/key}
	</svg>
</div>
<p style="position: absolute; top: 30px;">
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
	}
</style>
