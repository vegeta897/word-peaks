<script lang="ts">
	import { bezierEasing } from '$lib/transitions'
	import type { XY } from '$lib/math'

	export let tiles: XY[] = []
	export let newTiles: XY[] = []
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number

	let animateElement: SVGAnimateElement

	$: tileDripIndexes = newTiles.map((_, i) => i).filter((i) => i % 6 === 0)

	// TODO: When tiles array changes, identify new tiles and put drips in them
	// Keep old pond path outline until new drips finish

	// TODO: Store pond number in each tile so drips can be ordered properly

	$: tileCenters = tiles.map(([x, y]) => [(x + 0.5) * 1.5, y + 0.5])
	$: hover =
		mouseOver &&
		tileCenters.some(([x, y]) => Math.abs(x - mouseX) < 0.9 && Math.abs(y - mouseY) < 0.6)

	let inColor = false

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

	function createPondPath(tiles: XY[]) {
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

	let pondPath: string
	let previousPondPath: string
	$: if (tiles) {
		previousPondPath = pondPath
		pondPath = createPondPath(tiles)
		if (previousPondPath !== pondPath) animateElement?.beginElement()
	}
</script>

<clipPath id="prev_pond_path"> <path d={previousPondPath} /> </clipPath>
<g on:mouseenter={() => (hover = true)} on:mouseleave={() => (hover = false)}>
	<g clip-path="url(#prev_pond_path)">
		<path fill="var(--landscape-color)" d={previousPondPath} />
		<path
			style:transform="translateY({hover ? 0 : 0.2}px)"
			style:transition="transform {800}ms ease-in-out"
			fill="var(--tertiary-color)"
			stroke-width="0.2"
			stroke="var(--landscape-color)"
			d={previousPondPath}
		/>
	</g>
	<path
		stroke-width="0.2"
		stroke="var(--landscape-color)"
		stroke-linecap="round"
		fill="none"
		d={previousPondPath}
	/>
	<animate
		attributeName="opacity"
		values="1;1;0"
		begin="pond_draw_animate.begin"
		dur="{1000 + tileDripIndexes.length * 200}ms"
		calcMode="spline"
		fill="freeze"
		keyTimes="0;0.8;1"
		keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicIn}"
	/>
</g>
<clipPath id="pond_path"> <path d={pondPath} /> </clipPath>
<g>
	<g clip-path="url(#pond_path)">
		{#if inColor}
			<path
				transform="translate(0 0.09)"
				stroke-width="0.09"
				stroke="#312236d0"
				fill="none"
				d={pondPath}
			/>
		{:else}
			<path fill="var(--landscape-color)" d={pondPath} />
			<path
				style:transform="translateY({hover ? 0 : 0.2}px)"
				style:transition="transform {800}ms ease-in-out"
				fill="var(--tertiary-color)"
				stroke-width="0.2"
				stroke="var(--landscape-color)"
				d={pondPath}
			/>
		{/if}
	</g>
	<path
		stroke-width="0.2"
		stroke={inColor ? 'none' : 'var(--landscape-color)'}
		stroke-linecap="round"
		fill={inColor ? 'var(--after-color)' : 'none'}
		d={pondPath}
	/>
	<animate
		bind:this={animateElement}
		id="pond_draw_animate"
		attributeName="opacity"
		values="0;0;1"
		dur="{1000 + tileDripIndexes.length * 200}ms"
		calcMode="spline"
		fill="freeze"
		keyTimes="0;0.8;1"
		keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicIn}"
		begin="indefinite"
	/>
</g>
<g clip-path="url(#pond_path)">
	{#each tileDripIndexes as tileIndex, t}
		{@const [x, y] = newTiles[tileIndex]}
		<ellipse fill="var(--after-color)" cx={(x + 0.5) * 1.5} cy={y + 0.5}>
			<animate
				attributeName="rx"
				values="0;6"
				calcMode="spline"
				fill="freeze"
				dur="1600ms"
				keySplines={bezierEasing.cubicOut}
				begin="pond_draw_animate.begin+{t * 200 + 'ms'}"
			/>
			<animate
				attributeName="ry"
				values="0;4"
				calcMode="spline"
				fill="freeze"
				dur="1600ms"
				keySplines={bezierEasing.cubicOut}
				begin="pond_draw_animate.begin+{t * 200 + 'ms'}"
			/>
		</ellipse>
	{/each}
	<animate
		attributeName="opacity"
		values="1;1;0"
		begin="pond_draw_animate.begin"
		dur="{1000 + tileDripIndexes.length * 200}ms"
		calcMode="spline"
		fill="freeze"
		keyTimes="0;0.8;1"
		keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicIn}"
	/>
</g>
{#if inColor}
	<path stroke-width="0.1" stroke="var(--after-color)" fill="none" d={pondPath} />
{/if}
<!-- {#each tiles as [x, y], t}
	<rect
		x={x * 1.5}
		{y}
		width="1.5"
		height="1"
		fill={tileDripIndexes.includes(t) ? '#fff4' : '#567de840'}
		stroke={newTiles.some(([nx, ny]) => nx === x && ny === y) ? '#4ff' : '#567de8'}
		stroke-width="0.1"
	/>
{/each} -->
