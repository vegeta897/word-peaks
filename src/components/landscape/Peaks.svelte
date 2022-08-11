<script lang="ts">
	import type { Board } from '$lib/data-model'
	import { beforeUpdate } from 'svelte'
	import Rand from 'rand-seed'
	import { flipInOutEasing } from '$lib/transitions'
	import { cubicInOut } from 'svelte/easing'

	export let board: Board
	export let rowHeight: number
	export let columnWidth: number

	type PeakTile = {
		x1: number
		x2: number
		y1: number
		y2: number
		rng: Rand
	}
	type Peak = {
		x: number
		y: number
		radius: number
	}
	const peakZones: PeakTile[] = []
	let peaks: Peak[] = []

	const MIN_RADIUS = 6
	const MAX_RADIUS = 24

	beforeUpdate(() => {
		peakZones.length = 0
		peaks = []
		for (let y = 0; y < board.length; y++) {
			const row = board[y]
			for (let x = 0; x < row.length; x++) {
				if (row[x].polarity >= 0) continue
				// Double row height because peak base is half screen-height
				const peakZone = {
					x1: x * columnWidth,
					y1: y * rowHeight * 2,
					x2: 0,
					y2: (y + 1) * rowHeight * 2,
					rng: new Rand(row[x].letter + y + x),
				}
				do {
					peakZone.x2 = (x + 1) * columnWidth
					x++
				} while (x < row.length && row[x].polarity < 0)
				peakZones.push(peakZone)
			}
		}
		// TODO: Random seed from letter and row number to determine first peak vertical position, then try to fill smaller peaks in rest of space (max radius must be smaller with each peak placed)
		for (const peakZone of peakZones) {
			const halfWidth = (peakZone.x2 - peakZone.x1) / 2
			const maxRadius = halfWidth - 4
			// Weigh toward 0.5
			const yOffset = flipInOutEasing(cubicInOut)(peakZone.rng.next()) * rowHeight
			peaks.push({
				x: peakZone.x1 + halfWidth,
				y: peakZone.y1 / 2 + yOffset,
				radius: Math.min(MAX_RADIUS, maxRadius),
			})
		}
		// peaks = peakTiles.map((peak) => ({
		// 	x: (peak.x + 0.5) * columnWidth,
		// 	y: (peak.y + 0.5) * rowHeight,
		// 	radius: (columnWidth * 0.9) / 2,
		// }))
	})

	let stroke = '#D6D3D7'
</script>

{#each peakZones as peak}
	<rect
		fill="#fff1"
		x={peak.x1}
		y={peak.y1 / 2}
		width={peak.x2 - peak.x1}
		height={(peak.y2 - peak.y1) / 2}
		rx="8"
	/>
{/each}
{#each peaks as peak}
	<path
		{stroke}
		fill="var(--tertiary-color)"
		stroke-width="1"
		stroke-linejoin="miter"
		stroke-miterlimit="8"
		d={`M${peak.x - peak.radius} ${peak.y}
				l${peak.radius} ${-peak.radius * 1.8}
				l${peak.radius} ${peak.radius * 1.8}
				a${peak.radius} ${peak.radius / 2} 0 0 1 ${-peak.radius * 2} 0
			Z`}
	/>
{/each}
