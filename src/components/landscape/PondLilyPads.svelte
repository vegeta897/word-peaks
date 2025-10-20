<script lang="ts">
	import { type FunState, funState } from '$lib/landscape/fun'
	import { type XY, randomFloat, randomInt } from '$lib/math'
	import { landscapeColor } from '$src/store'

	const { pondTiles } = funState

	let lilyPads: Map<
		string,
		{ grid: string; center: XY; path: string; duration: number; frozen?: boolean }
	> = new Map()
	$: getLilyPadTiles($pondTiles)

	function getLilyPadTiles(pondTiles: FunState['pondTiles']) {
		// console.log('checking pond tiles...', pondTiles.size)
		for (const [grid, tile] of pondTiles) {
			if (!tile.lily) continue
			if (tile.state === 'frozen') {
				lilyPads.get(grid)!.frozen = true
				continue
			} else if (tile.state === 'broken') {
				lilyPads.delete(grid)
				continue
			}
			if (lilyPads.has(grid)) continue
			const [xString, yString] = grid.split(':')
			const cx = (+xString + randomFloat(0.4, 0.6)) * 15
			const cy = (+yString + randomFloat(0.4, 0.6)) * 10
			const rx = randomFloat(3.8, 4.5)
			const ry = rx //(rx * 2) / 3
			const p1Angle = randomFloat(0, Math.PI * 2)
			const p2Angle = p1Angle + randomFloat(0.9, 1.1)
			const [p1x, p1y]: XY = [cx + Math.cos(p1Angle) * rx, cy + Math.sin(p1Angle) * ry]
			const [p2x, p2y] = [cx + Math.cos(p2Angle) * rx, cy + Math.sin(p2Angle) * ry]
			lilyPads.set(grid, {
				grid,
				path: `M${cx},${cy} L${p1x},${p1y} A${rx},${ry} 0 1 0 ${p2x},${p2y} Z`,
				center: [cx, cy],
				duration: randomInt(400, 1000),
			})
		}
		lilyPads = lilyPads // Reactivity
	}
</script>

{#each [...lilyPads.values()] as { grid, path, frozen, duration, center: [cx, cy] } (grid)}
	{@const color = `var(--${
		$landscapeColor
			? frozen
				? 'ice-shelf'
				: 'correct'
			: frozen
			? 'tertiary'
			: 'landscape'
	}-color)`}
	<path
		d={path}
		fill={color}
		stroke={color}
		style:transition="stroke {$landscapeColor && !frozen ? 200 : 1000}ms ease, fill {$landscapeColor &&
		!frozen
			? 200
			: 1000}ms ease, opacity 1000ms ease"
		stroke-linejoin="round"
		stroke-width="0.8"
		opacity={frozen && $landscapeColor ? 0.5 : 1}
		class="lily"
		style:transform-origin="{cx}px {cy}px"
		style:animation-delay="{500 + duration}ms"
		style:animation-duration="{duration * 1.5}ms"
	/>
{/each}

<style>
	.lily {
		transform: scale(1, 0.66);
		animation: spin-out cubic-bezier(0.33, 1, 0.68, 1) both;
	}
	@keyframes spin-out {
		0% {
			transform: scale(0.01, 0.0066) rotate(500deg);
		}
		100% {
			transform: scale(1, 0.66);
		}
	}
</style>
