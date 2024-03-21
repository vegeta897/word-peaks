<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { Landscape } from '$lib/landscape'
	import { getLandscape } from '$lib/landscape'
	import Tree from './landscape/Tree.svelte'
	import Hill from './landscape/Hill.svelte'
	import Pond from './landscape/Pond.svelte'

	// TODO: Scale these down for smaller container widths
	const TILE_WIDTH = 18
	const TILE_HEIGHT = 12

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
	}

	function updateDimensions(width: number, height: number) {
		const newWidth = Math.floor(width / TILE_WIDTH)
		const newHeight = Math.floor(height / TILE_HEIGHT)
		if (newWidth === landscape.width && newHeight === landscape.height) return
		landscape.width = newWidth
		landscape.height = newHeight
		landscape.centerX = Math.floor(newWidth / 2)
		landscape.centerY = Math.floor(newHeight / 2)
		// console.log('center', centerGrid)
		svgWidth = newWidth * TILE_WIDTH
		svgHeight = newHeight * TILE_HEIGHT
		clearLandscape()
		updateLandscape()
	}

	function clearLandscape() {
		landscape.rowsGenerated = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
		landscape.nextPondID = 1
	}

	function updateLandscape() {
		// TODO: Check if metrics have changed, or current row exceeds drawn rows
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
		landscape = getLandscape(landscape, get(store.boardContent), currentRow, `${seed}`)
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
	let redraw = 0
	let seed = 0

	// TODO: Might want to set viewbox equal to svg dimensions to avoid blurry lines
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		viewBox="0 0 {landscape.width * 1.5} {landscape.height}"
		on:click={() => redraw++}
	>
		{#key redraw}
			{#each landscape.features as feature}
				{#if feature.type === 'tree'}
					<Tree
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
					/>
				{:else if feature.type === 'hill'}
					<Hill
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
					/>
				{:else}
					<Pond tiles={feature.tiles} />
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
