<script lang="ts">
	import type { Board } from '$lib/data-model'
	import { beforeUpdate } from 'svelte'

	export let board: Board
	export let rowHeight: number
	export let columnWidth: number

	let cachedBoard: Board

	type Peak = {
		x: number
		y: number
		radius: number
	}
	const peakTiles: { x: number; y: number }[] = []
	let peaks: Peak[] = []

	beforeUpdate(() => {
		if (board !== cachedBoard) {
			cachedBoard = board
			peakTiles.length = 0
			for (let y = 0; y < board.length; y++) {
				const row = board[y]
				for (let x = 0; x < row.length; x++) {
					if (row[x].polarity < 0) {
						peakTiles.push({ x, y })
					}
				}
			}
		}
		peaks = peakTiles.map((peak) => ({
			x: (peak.x + 0.5) * columnWidth,
			y: (peak.y + 0.5) * rowHeight,
			radius: (columnWidth * 0.9) / 2,
		}))
	})

	let stroke = '#D6D3D7'
</script>

{#each peaks as peak}
	<path
		{stroke}
		fill="var(--tertiary-color)"
		stroke-width="1"
		stroke-linejoin="miter"
		stroke-miterlimit="8"
		d={`M${peak.x - peak.radius} ${peak.y}
				l${peak.radius} ${-peak.radius * 1.4}
				l${peak.radius} ${peak.radius * 1.4}
				a${peak.radius} ${peak.radius / 2} 0 0 1 ${-peak.radius * 2} 0
			Z`}
	/>
{/each}
