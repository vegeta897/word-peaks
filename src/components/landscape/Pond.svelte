<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	export let delay = 0
	export let tiles: [x: number, y: number][] = []
	let draw = false

	// TODO: Blue drops fall from above, falling into pond and turn into expanding circles
	// which then fade out?

	type Dir = 0 | 1 | 2 | 3 // down | right | up | left
	type Edge = [x1: number, y1: number, x2: number, y2: number, dir: Dir]
	const EDGES: Edge[] = [
		[0, 0, 0, 1, 0],
		[0, 1, 1, 1, 1],
		[1, 1, 1, 0, 2],
		[1, 0, 0, 0, 3],
	]
	const nextDirOffets = [1, 3, 0]

	function crawlTiles(tiles: [x: number, y: number][]) {
		const segmentMap: Map<string, string> = new Map()
		const startsMap: Map<string, string> = new Map()
		for (const [x, y] of tiles) {
			for (const [ex1, ey1, ex2, ey2, dir] of EDGES) {
				const sx1 = x + ex1
				const sy1 = y + ey1
				const sx2 = x + ex2
				const sy2 = y + ey2
				const startKey = `${sx1}:${sy1}:${dir}`
				const segmentKey =
					dir > 1 ? `${sx2}:${sy2}:${dir % 2}` : `${sx1}:${sy1}:${dir % 2}`
				const existingSegment = segmentMap.get(segmentKey)
				if (existingSegment) {
					segmentMap.delete(segmentKey)
					startsMap.delete(existingSegment)
				} else {
					segmentMap.set(segmentKey, startKey)
					startsMap.set(startKey, `${sx2}:${sy2}`)
				}
			}
		}
		const paths: [x: number, y: number][][] = []
		let currentPath: [x: number, y: number][] = []
		let nextStartKey: string | undefined = undefined
		while (startsMap.size > 0) {
			const [startKey, toGrid] = nextStartKey
				? [nextStartKey, startsMap.get(nextStartKey)!]
				: [...startsMap][0]
			startsMap.delete(startKey)
			nextStartKey = undefined
			const [startX, startY, dir] = startKey.split(':').map((v) => +v)
			currentPath.push([startX, startY])
			for (const dirOffset of nextDirOffets) {
				const tryStartKey: string = `${toGrid}:${(dir + dirOffset) % 4}`
				if (startsMap.has(tryStartKey)) {
					nextStartKey = tryStartKey
					break
				}
			}
			if (!nextStartKey) {
				paths.push(currentPath)
				currentPath = []
			}
		}
		return paths
	}

	function pathsToDataString(paths: [x: number, y: number][][]) {
		let d = ''
		for (const path of paths) {
			let [lastX, lastY] = path[0]
			let dPart = `M${lastX * 1.5} ${lastY}`
			for (let i = 1; i < path.length; i++) {
				const [x, y] = path[i]
				dPart += `L${x * 1.5} ${y}`
			}
			d += dPart + 'Z'
		}
		return d
	}

	$: paths = crawlTiles(tiles)

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<!-- {#each tiles as [x, y]}
		<rect
			x={x * 1.5}
			{y}
			width="1.5"
			height="1"
			fill="#567de840"
			stroke="#567de8"
			stroke-width="0.1"
		/>
	{/each} -->
	<!-- <path stroke-width="0.2" stroke="#fff" fill="none" d="M1.5,2 Q3,2 3,3 T1.5,4" />
	<path
		stroke-width="0.2"
		stroke="#fff"
		fill="none"
		d="M1.5,5 A1.5 1 0 0 1 3,6 A1.5 1 0 0 1 1.5,7"
	/> -->
	<path stroke-width="0.2" stroke="#fff" fill="none" d={pathsToDataString(paths)} />
	<!-- <svg {x} {y} viewBox="0 0 70 40" width="35" height="20">
		<path
			stroke="#fff"
			stroke-width="20"
			stroke-linecap="round"
			d="M20,10 h30 M10,20 h50 M30,30 h25"
		/>
		<path
			stroke="#312236"
			stroke-width="12"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M20,20 V10 h30 V20 M10,20 h50 M30,20 V30 h25 V20"
		/>
		<path
			stroke="#ffffff"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M18 15 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 14.14 0 a10 10 0 0 0 7.07 2.93 M34 30 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 7.07 2.93"
		/>
	</svg> -->
{/if}
