<script lang="ts">
	import { boardContent, currentRow } from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate } from 'svelte'
	// import Hill from '$com/landscape/Hill.svelte'
	// import Tree from '$com/landscape/Tree.svelte'
	// import Pond from '$com/landscape/Pond.svelte'
	import type { Landscape } from '$lib/landscape'
	import { getFeatures } from '$lib/landscape'

	// TODO: Add animations on touch

	export let width: number
	export let height: number

	let landscape: null | Landscape

	function updateLandscape() {
		// TODO: Check if metrics have changed, or current row exceeds drawn rows
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (!width || !height) return
		const documentStyle = getComputedStyle(document.documentElement)
		const rowMargin = parseInt(
			documentStyle.getPropertyValue('--tile-row-margin-bottom').split('px')[0]
		)
		const tileHeight = parseInt(documentStyle.getPropertyValue('--tile-size').split('px')[0])
		if (
			!landscape ||
			landscape.metrics.width !== width ||
			landscape.metrics.height !== height ||
			landscape.metrics.tileHeight !== tileHeight ||
			landscape.metrics.rowMargin !== rowMargin
		) {
			landscape = {
				rows: 0,
				metrics: {
					width,
					height,
					tileHeight,
					rowMargin,
				},
				features: [],
			}
		}
		getFeatures(landscape, get(boardContent), get(currentRow))
	}

	beforeUpdate(() => updateLandscape())
	currentRow.subscribe(() => updateLandscape())

	let redraw = 0
</script>

<svg xmlns="http://www.w3.org/2000/svg" on:click={() => redraw++}>
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
		{#each landscape.features as feature}
			<svelte:component this={feature.component} {...feature.props} />
		{/each}
	{/key}
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>
