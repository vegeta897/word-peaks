<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'
	import type { XY } from '$lib/math'

	export let id: number
	export let delay = 0
	export let tiles: XY[] = []

	let animateElement: SVGAnimateElement

	export function redraw(/*delay = 0*/) {
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

	function getPathSegment([x, y]: XY, [midX, midY]: XY, [prevMidX, prevMidY]: XY) {
		if (prevMidX === midX || prevMidY === midY) {
			return `L${midX * 1.5} ${midY}`
		} else {
			return `Q${x * 1.5} ${y} ${midX * 1.5} ${midY}`
		}
	}

	function createPondPath(tiles: [x: number, y: number][]) {
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
		let pathData = ''
		let newPath = true
		let prevMid: XY
		let first: XY
		let firstMid: XY
		let nextStartKey: string | undefined = undefined
		while (startsMap.size > 0) {
			const [startKey, toGrid] = nextStartKey
				? [nextStartKey, startsMap.get(nextStartKey)!]
				: [...startsMap][0]
			startsMap.delete(startKey)
			nextStartKey = undefined
			const [startX, startY, dir] = startKey.split(':').map((v) => +v)
			const [toX, toY] = toGrid.split(':').map((v) => +v)
			const midX = (startX + toX) / 2
			const midY = (startY + toY) / 2
			if (newPath) {
				first = [startX, startY]
				firstMid = [midX, midY]
				pathData += `M${midX * 1.5} ${midY}`
			} else {
				pathData += getPathSegment([startX, startY], [midX, midY], prevMid!)
			}
			newPath = false
			prevMid = [midX, midY]
			for (const dirOffset of nextDirOffets) {
				const tryStartKey: string = `${toGrid}:${(dir + dirOffset) % 4}`
				if (startsMap.has(tryStartKey)) {
					nextStartKey = tryStartKey
					break
				}
			}
			if (!nextStartKey) {
				pathData += getPathSegment(first!, firstMid!, prevMid)
				pathData += 'Z'
				newPath = true
			}
		}
		return pathData
	}

	$: pondPath = createPondPath(tiles)

	onMount(() => setTimeout(() => (draw = true), delay))
	$: animateElement?.beginElement()
</script>

{#if draw}
	{#if inColor}
		<path fill="#567de8" d={pondPath} />
	{:else}
		<path
			stroke-width="0.2"
			stroke="#fff"
			stroke-linecap="round"
			fill="none"
			d={pondPath}
		/>
	{/if}
	<clipPath id="pond_path{id}"> <path d={pondPath} /> </clipPath>
	<g clip-path="url(#pond_path{id})">
		{#if inColor}
			<path
				transform="translate(0 0.09)"
				stroke-width="0.09"
				stroke="#312236d0"
				fill="none"
				d={pondPath}
			/>
		{:else}
			<path
				transform="translate(0 0.15)"
				stroke-width="0.2"
				stroke-linecap="round"
				stroke="#fff"
				fill="none"
				d={pondPath}
			/>
		{/if}
	</g>
	{#if inColor}
		<path stroke-width="0.1" stroke="#567de8" fill="none" d={pondPath} />
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
