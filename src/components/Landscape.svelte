<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate } from 'svelte'
	// import Hill from '$com/landscape/Hill.svelte'
	// import Tree from '$com/landscape/Tree.svelte'
	// import Pond from '$com/landscape/Pond.svelte'
	import type { Landscape } from '$lib/landscape'
	import { getLandscape, xyToGrid } from '$lib/landscape'

	const TILE_WIDTH = 12
	const TILE_HEIGHT = 8

	// TODO: Add animations on touch

	// TODO: Remember to test new-player UX

	let containerWidth: number
	let containerHeight: number
	let svgWidth: number = 0
	let svgHeight: number = 0
	let xTiles: number = 0
	let yTiles: number = 0

	let landscape: Landscape = {
		rows: 0,
		features: [],
		tileMap: new Map(),
		openTiles: new Map(),
	}

	function clearLandscape() {
		landscape.rows = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
	}

	function updateLandscape() {
		// TODO: Check if metrics have changed, or current row exceeds drawn rows
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (!containerWidth || !containerHeight) return
		// console.log('container', containerWidth, 'x', containerHeight)
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rows > 0) clearLandscape()
			return
		}
		const newXTiles = Math.floor(containerWidth / TILE_WIDTH)
		const newYTiles = Math.floor(containerHeight / TILE_HEIGHT)
		// console.log('tiles', newXTiles, 'x', newYTiles)
		if (newXTiles !== xTiles || newYTiles !== newYTiles) {
			xTiles = newXTiles
			yTiles = newYTiles
			svgWidth = xTiles * TILE_WIDTH
			svgHeight = yTiles * TILE_HEIGHT
			clearLandscape()
		}
		if (currentRow > landscape.rows) {
			const [centerX, centerY] = [Math.floor(xTiles / 2), Math.floor(yTiles / 2)]
			const centerGrid = xyToGrid([centerX, centerY])
			console.log('center', centerGrid)
			landscape.openTiles.set(centerGrid, { x: centerX, y: centerY })
		}
		if (currentRow === landscape.rows) return
		// TODO: Return generation time to see on iOS
		landscape = getLandscape(
			xTiles,
			yTiles,
			landscape,
			get(store.boardContent),
			currentRow
		)
	}
	beforeUpdate(() => updateLandscape())
	store.currentRow.subscribe(() => updateLandscape())
	let redraw = 0
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		viewBox="0 0 {xTiles * 1.5} {yTiles}"
		on:click={() => redraw++}
	>
		{#key redraw}
			<!--		<Hill x={50} y={40} width={50} length={20} />-->
			<!--		<Hill x={18} y={16} width={35} length={10} delay={200} />-->
			<!--		<Hill x={60} y={10} width={30} length={10} delay={350} />-->
			<!--		<Hill x={20} y={50} width={25} length={10} delay={450} />-->
			<!--		<Hill x={95} y={25} width={25} length={5} delay={500} />-->
			<!--		<Tree x={103} y={48} width={15} length={8} delay={500} />-->
			<!--		<Tree x={121} y={54} width={15} length={8} delay={700} />-->
			<!--		<Tree x={114} y={69} width={11} length={6} delay={900} />-->
			<!--		<Pond x={124} y={22} />-->
			{#each landscape.features as { component, x, y, props }}
				<svelte:component this={component} {x} {y} {...props} />
			{/each}
		{/key}
	</svg>
</div>

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
