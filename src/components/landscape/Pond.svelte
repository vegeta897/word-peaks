<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	export let id: number
	export let delay = 0
	export let tiles: [x: number, y: number][] = []

	let animateElement: SVGAnimateElement

	export function redraw(delay = 0) {
		if (delay) setTimeout(() => animateElement?.beginElement(), delay)
		else animateElement?.beginElement()
	}

	let draw = false
	let inColor = false

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
		const paths: [x: number, y: number, midX: number, midY: number][][] = []
		let currentPath: [x: number, y: number, midX: number, midY: number][] = []
		let nextStartKey: string | undefined = undefined
		while (startsMap.size > 0) {
			const [startKey, toGrid] = nextStartKey
				? [nextStartKey, startsMap.get(nextStartKey)!]
				: [...startsMap][0]
			startsMap.delete(startKey)
			nextStartKey = undefined
			const [startX, startY, dir] = startKey.split(':').map((v) => +v)
			const [toX, toY] = toGrid.split(':').map((v) => +v)
			currentPath.push([startX, startY, (startX + toX) / 2, (startY + toY) / 2])
			for (const dirOffset of nextDirOffets) {
				const tryStartKey: string = `${toGrid}:${(dir + dirOffset) % 4}`
				if (startsMap.has(tryStartKey)) {
					nextStartKey = tryStartKey
					break
				}
			}
			if (!nextStartKey) {
				currentPath.push(currentPath[0]) // Path back to start
				paths.push(currentPath)
				currentPath = []
			}
		}
		return paths
	}

	// TODO: Draw path in crawlTiles function
	function pathsToDataString(
		paths: [x: number, y: number, midX: number, midY: number][][]
	) {
		let d = ''
		for (const path of paths) {
			let [, , lastX, lastY] = path[0]
			let dPart = `M${lastX * 1.5} ${lastY}`
			for (let i = 1; i < path.length; i++) {
				const [x, y, midX, midY] = path[i]
				if (lastX === midX || lastY === midY) {
					dPart += `L${midX * 1.5} ${midY}`
				} else {
					dPart += `Q${x * 1.5} ${y} ${midX * 1.5} ${midY}`
				}
				lastX = midX
				lastY = midY
			}
			d += dPart + 'Z'
		}
		return d
	}

	$: paths = crawlTiles(tiles)
	$: pathString = pathsToDataString(paths)
	$: pathLength = paths.reduce((acc, path) => acc + path.length, 0) * 1.2

	onMount(() => setTimeout(() => (draw = true), delay))
	$: animateElement?.beginElement()
</script>

{#if draw}
	{#if inColor}
		<path fill="#567de8" d={pathString} />
	{:else}
		<path
			stroke-width="0.2"
			stroke="#fff"
			stroke-linecap="round"
			fill="none"
			stroke-dasharray={pathLength}
			d={pathString}
		>
			<animate
				bind:this={animateElement}
				attributeName="stroke-dashoffset"
				id="pond_draw_animate_{id}"
				begin="indefinite"
				values="{pathLength};0"
				calcMode="spline"
				keySplines={bezierEasing.sineInOut}
				dur="{pathLength * 80}ms"
				fill="freeze"
			/>
		</path>
	{/if}
	<clipPath id="pond_path{id}"> <path d={pathString} /> </clipPath>
	<g clip-path="url(#pond_path{id})">
		{#if inColor}
			<path
				transform="translate(0 0.09)"
				stroke-width="0.09"
				stroke="#312236d0"
				fill="none"
				d={pathString}
			/>
		{:else}
			<path
				transform="translate(0 0.15)"
				stroke-width="0.2"
				stroke-linecap="round"
				stroke="#fff"
				fill="none"
				stroke-dasharray={pathLength}
				d={pathString}
			>
				<animate
					attributeName="stroke-dashoffset"
					begin="pond_draw_animate_{id}.begin"
					values="{pathLength};0"
					calcMode="spline"
					keySplines={bezierEasing.sineInOut}
					dur="{pathLength * 80}ms"
					fill="freeze"
				/>
			</path>
		{/if}
	</g>
	{#if inColor}
		<path stroke-width="0.1" stroke="#567de8" fill="none" d={pathString} />
	{/if}
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
{/if}
