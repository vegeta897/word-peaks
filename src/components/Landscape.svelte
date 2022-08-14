<script lang="ts">
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import type { Board } from '$lib/data-model'
	import { boardContent, currentRow } from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate, onMount } from 'svelte'
	import Hill from '$com/landscape/Hill.svelte'
	import Tree from '$com/landscape/Tree.svelte'
	import Pond from '$com/landscape/Pond.svelte'

	// TODO: Add animations on touch

	export let landWidth: number
	export let landHeight: number

	let columnWidth: number
	let rowMargin: number
	let rowHeight: number
	let tileHeight: number
	let drawnRows: null | Board

	$: canDraw = drawnRows && landWidth > 0 && landHeight > 0 && $currentRow > 0 && rowMargin >= 0

	beforeUpdate(() => {
		const documentStyle = getComputedStyle(document.documentElement)
		rowMargin = parseInt(documentStyle.getPropertyValue('--tile-row-margin-bottom').split('px')[0])
		tileHeight = parseInt(documentStyle.getPropertyValue('--tile-size').split('px')[0])
		columnWidth = landWidth / WORD_LENGTH
		rowHeight = landHeight / ROWS
	})

	onMount(() => {
		currentRow.subscribe((cr) => {
			drawnRows = get(boardContent).slice(0, cr)
		})
	})

	let redraw = 0
</script>

{#if canDraw}
	<svg xmlns="http://www.w3.org/2000/svg" on:click={() => redraw++}>
		{#key redraw}
			<Hill x={50} y={50} width={50} length={20} />
			<Hill x={18} y={25} width={35} length={10} delay={200} />
			<Hill x={60} y={18} width={30} length={10} delay={350} />
			<Hill x={20} y={60} width={25} length={10} delay={450} />
			<Hill x={95} y={35} width={25} length={5} delay={500} />
			<Tree x={103} y={58} width={15} length={8} delay={500} />
			<Tree x={121} y={64} width={15} length={8} delay={700} />
			<Tree x={114} y={79} width={11} length={6} delay={900} />
			<Pond x={124} y={32} />
		{/key}
	</svg>
{/if}

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>
