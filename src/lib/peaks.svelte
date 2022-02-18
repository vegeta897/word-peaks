<script lang="ts">
	import { ROWS } from '$lib/data-model'
	import { afterUpdate } from 'svelte'

	const LERPS = 8
	const FIRST_LINE_DUR = 800
	const LERP_TOTAL_DUR = 1200
	const LERP_EACH_DUR = `${Math.round(LERP_TOTAL_DUR / LERPS)}ms`

	export let boardCommitted = []
	export let currentRow

	type Point = [number, number]

	function easeOutQuad(x: number): number {
		return 1 - (1 - x) * (1 - x)
	}

	function easeInOutQuad(x: number): number {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
	}

	function easeInOutSine(x: number): number {
		return -(Math.cos(Math.PI * x) - 1) / 2
	}

	$: rows = boardCommitted.map((row, r) => [
		[0, 50 + 100 * r],
		...row.map((tile, i) => {
			const height = easeInOutSine(tile.magnitude / (ROWS * 2 - 1))
			return [i * 100 + 50, 100 * r + 50 + tile.polarity * height * 50]
		}),
		[500, 50 + 100 * r],
	])

	function stringifyPoints(points: Point[]): string {
		// Add .001 to prevent invisible horizontal line bug
		return points.map((p) => p.map((n) => Math.round(n)).join(',')).join(' ') + '.001'
	}

	function lerpLines(line1: Point[], line2: Point[], x: number): Point[] {
		return line1.map((p, i) => [p[0], p[1] + (line2[i][1] - p[1]) * x])
	}

	function flatten(line: Point[], row: number) {
		return line.map((p) => [p[0], 50 + row * 100])
	}

	afterUpdate(() => {
		document.querySelectorAll('animate').forEach((element) => {
			if (element.id === `line${currentRow - 2}_0`) element.beginElement()
		})
	})
</script>

{#key stringifyPoints(rows)}
	<svg viewBox="0 -1 500 602" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
		<defs>
			<linearGradient id="graphMaskGradient">
				<stop offset="0%" stop-color="#000" />
				<stop offset="8.3%" stop-color="#fff" />
				<stop offset="91.7%" stop-color="#fff" />
				<stop offset="100%" stop-color="#000" />
			</linearGradient>
		</defs>
		<mask id="graphMask">
			<rect x="0" y="-1" width="500" height="602" fill="url('#graphMaskGradient')" />
		</mask>
		{#each rows as row, r}
			<polyline
				class="polyline"
				stroke="#fffb"
				points={r === currentRow - 1
					? stringifyPoints(
							r === 0 ? flatten(row, r) : lerpLines(rows[r - 1], row, LERPS / (LERPS + 1))
					  )
					: stringifyPoints(row)}
				opacity={r === currentRow - 1 ? 0 : 1}
			>
				{#if r === currentRow - 1}
					<animate
						id={`line${r}`}
						attributeName="points"
						dur={r === 0 ? `${FIRST_LINE_DUR}ms` : LERP_EACH_DUR}
						begin={r === 0 ? '0s' : `line${r - 1}_${LERPS - 1}.end`}
						from={stringifyPoints(
							r === 0 ? flatten(row, r) : lerpLines(rows[r - 1], row, LERPS / (LERPS + 1))
						)}
						to={stringifyPoints(row)}
						fill="freeze"
					/>
					<animate
						attributeName="opacity"
						from="0.5"
						to="1"
						begin={r === 0 ? '0s' : `line${r - 1}_${LERPS - 1}.end`}
						dur={LERP_EACH_DUR}
						fill="freeze"
					/>
				{/if}
			</polyline>
			<!--{#each [0, 1, 2, 3, 4] as p}-->
			<!--	<text x={row[p + 1][0]} y={row[p + 1][1] - 2} fill="#fff" font-size="18px"-->
			<!--		>{boardCommitted[r][p].magnitude}</text-->
			<!--	>-->
			<!--{/each}-->
			{#if currentRow > r + 1}
				{#each Array(LERPS) as _, i}
					<polyline
						class="polyline"
						stroke={`rgba(255,255,255,${0.05 + Math.abs(i - LERPS / 2) / (LERPS * 2)})`}
						points={r === currentRow - 2
							? stringifyPoints(lerpLines(row, rows[r + 1], i / (LERPS + 1)))
							: stringifyPoints(lerpLines(row, rows[r + 1], (i + 1) / (LERPS + 1)))}
						opacity={r === currentRow - 2 ? 0 : 1}
					>
						{#if r === currentRow - 2}
							<animate
								id={`line${r}_${i}`}
								attributeName="points"
								begin={i === 0 ? '0s' : `line${r}_${i - 1}.end`}
								dur={LERP_EACH_DUR}
								from={stringifyPoints(lerpLines(row, rows[r + 1], i / (LERPS + 1)))}
								to={stringifyPoints(lerpLines(row, rows[r + 1], (i + 1) / (LERPS + 1)))}
								fill="freeze"
							/>
							<animate
								attributeName="opacity"
								from="0.5"
								to="1"
								begin={i === 0 ? '0s' : `line${r}_${i - 1}.end`}
								dur={LERP_EACH_DUR}
								fill="freeze"
							/>
						{/if}
					</polyline>
				{/each}
			{/if}
		{/each}
	</svg>
{/key}

<style>
	svg {
		width: 100%;
		height: 100%;
	}
	.polyline {
		vector-effect: non-scaling-stroke;
		fill: none;
		stroke-width: 1;
		mask: url('#graphMask');
	}
</style>
