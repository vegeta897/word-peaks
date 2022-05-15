<script lang="ts">
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import type { Board } from '$lib/data-model'
	import { boardContent, currentRow } from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate, onMount } from 'svelte'
	import Peak from '$com/landscape/Peak.svelte'
	import Grass from '$com/landscape/Grass.svelte'

	// TODO: Add animations on touch

	// Stick with white outlines, filled in white for grass?

	// Make perspective change with graph aspect ratio? (instead of 2:1 width:height)

	// Hills/lakes have more greenery with lower magnitudes

	export let graphWidth: number
	export let graphHeight: number

	let columnWidth: number
	let platformRadius: number
	let rowMargin: number
	let rowHeight: number
	let tileHeight: number
	let featureHeight: number
	let graphedRows: null | Board

	$: canDraw =
		graphedRows && graphWidth > 0 && graphHeight > 0 && $currentRow >= 0 && rowMargin >= 0

	beforeUpdate(() => {
		rowMargin = parseInt(
			getComputedStyle(document.documentElement)
				.getPropertyValue('--tile-row-margin-bottom')
				.split('px')[0]
		)
		columnWidth = graphWidth / WORD_LENGTH
		rowHeight = graphHeight / ROWS
		tileHeight = rowHeight - rowMargin
		featureHeight = rowHeight - platformHeight * 2
		platformRadius = Math.min(columnWidth / 2, tileHeight / 3)
	})

	const platformHeight = 8

	onMount(() => {
		currentRow.subscribe((cr) => {
			graphedRows = get(boardContent).slice(0, cr)
		})
	})
</script>

{#if canDraw}
	<svg xmlns="http://www.w3.org/2000/svg">
		<rect
			x="0.5"
			y={platformHeight + 0.5}
			width={graphWidth - 1}
			height={rowHeight * $currentRow - platformHeight * 2 - 1}
			stroke="#D6D3D7"
			stroke-width="1"
			fill="none"
			rx={platformRadius}
		/>
		<path
			fill="none"
			stroke="#D6D3D7"
			stroke-width="1"
			d={`M0.5 ${rowHeight * $currentRow - platformHeight - platformRadius - 1}
				v${platformHeight}
				a${platformRadius} ${platformRadius} 0 0 0 ${platformRadius} ${platformRadius}
				h${graphWidth - platformRadius * 2 - 1}
				a${platformRadius} ${platformRadius} 0 0 0 ${platformRadius} ${-platformRadius}
				v${-platformHeight}
			`}
		/>
		<Grass board={graphedRows} {rowHeight} {columnWidth} />
	</svg>
{/if}

<style>
	svg {
		width: 100%;
		height: 100%;
	}
	:root {
		--ground-color: #c76dab;
		--ground-edge-color: #b05492;
	}
</style>
