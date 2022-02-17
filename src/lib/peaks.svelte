<script lang="ts">
	import { ROWS } from '$lib/data-model'

	const LERPS = 8

	export let boardContent
	export let currentRow

	type Point = [number, number]

	function easeOutQuad(x: number): number {
		return 1 - (1 - x) * (1 - x)
	}

	$: rows = boardContent.slice(0, currentRow).map((row, r) => [
		[0, 50 + 100 * r],
		...row.map((tile, i) => {
			const height = easeOutQuad(tile.magnitude / (ROWS * 2 - 1))
			return [i * 100 + 50, Math.round(100 * r + 50 + tile.polarity * height * 50)]
		}),
		[500, 50 + 100 * r],
	])

	function stringifyPoints(points: Point[]): string {
		return points.map((p) => p.join(',')).join(' ')
	}

	function lerpLines(line1: Point[], line2: Point[], x: number, r): Point[] {
		return line1.map((p, i) => [p[0], p[1] + (line2[i][1] - p[1]) * x])
	}
</script>

<svg viewBox="0 -1 500 602" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
	{#each rows as row, r}
		<polyline
			vector-effect="non-scaling-stroke"
			stroke="#fffb"
			fill="none"
			stroke-width="1"
			points={stringifyPoints(row)}
		/>
		{#if currentRow > r + 1}
			{#each Array(LERPS) as _, i}
				<polyline
					vector-effect="non-scaling-stroke"
					stroke={`rgba(255,255,255,${0.05 + Math.abs(i - LERPS / 2) / (LERPS * 2)})`}
					fill="none"
					stroke-width="1"
					points={stringifyPoints(lerpLines(row, rows[r + 1], (i + 1) / (LERPS + 1), r))}
				/>
			{/each}
		{/if}
	{/each}
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>
