<script lang="ts">
	import { bezierEasing } from '$lib/transitions'
	import { getDistance, getNeighbors, xyToGrid, type XY } from '$lib/math'
	import { tick } from 'svelte'
	import { createPondPath } from '$lib/landscape/pond'

	export let tiles: XY[] = []
	export let newTiles: XY[] = []
	export let animate: boolean
	export let delay: number
	export let landscapeWidth: number
	export let landscapeHeight: number
	export let mini = false
	export let forceColor: boolean

	$: maxDistance = getDistance(landscapeWidth, landscapeHeight)
	$: expandDuration = maxDistance * 70

	type Flood = [id: number, ...XY, duration: number, SVGAnimateElement, keyTimes: string]
	let floods: Flood[] = []
	let floodID = 0
	export async function flashColor(x: number, y: number, duration: number) {
		if (forceColor) return
		const fullDuration = duration + 800
		const expandKeyTime = expandDuration / fullDuration
		const fadeKeyTime = Math.max(expandKeyTime, 1 - 800 / fullDuration)
		const flood = [
			++floodID,
			x,
			y,
			fullDuration,
			null /* Animate element will bind here */,
			`0;${expandKeyTime};${fadeKeyTime};1`,
		] as unknown as Flood
		floods = [...floods, flood]
		await tick()
		flood[4]?.beginElement()
		setTimeout(() => {
			floods = floods.filter((r) => r !== flood)
		}, fullDuration)
	}

	let pondPath: string
	let previousPondPath: string
	let tileGrids: Set<string>

	let dripTiles: XY[] = []
	let dripsID = 0
	let dripDelay: number
	let dripDuration: number
	let pondAnimateElement: SVGAnimateElement

	type DrainedTile = {
		xy: XY
		drainage: number
	}

	const drainedTilesMap: Map<string, DrainedTile> = new Map()
	let drainedTiles: DrainedTile[] = []
	// let drainingTime = 0
	// let drainingOrigin: XY | null = null
	// let drainingGradientElement: SVGAnimateElement
	// let drainingRadius = 0
	let nonDrainedPath: string

	export async function doFun(x: number, y: number) {
		const normalizedX = x / 1.5
		// const clickedTile: XY = [Math.floor(normalizedX), Math.floor(y)]
		// if (!tileGrids.has(xyToGrid(clickedTile))) return
		const nonDrainedTiles: Map<string, XY> = new Map()
		for (let xy of tiles) {
			const grid = xyToGrid(xy)
			const distance = getDistance(xy[0] + 0.5 - normalizedX, xy[1] + 0.5 - y)
			if (distance <= 2) {
				const drainedTile = drainedTilesMap.get(grid)
				const drainage = 1 - distance / 2
				// TODO: Use only a few drainage states, no floating point math
				if (drainedTile) {
					drainedTile.drainage =
						drainedTile.drainage > 0.5 ? 1 : Math.min(1, drainedTile.drainage + drainage)
					if (drainedTile.drainage > 0.95) drainedTile.drainage = 1
				} else {
					drainedTilesMap.set(grid, { xy, drainage })
				}
			} else if (!drainedTilesMap.has(grid)) {
				nonDrainedTiles.set(grid, xy)
			}
		}
		// drainedPath = createPondPath([...drainedTilesMap].map(([, {xy}]) => xy))
		drainedTiles = [...drainedTilesMap].map(([, dt]) => dt)
		nonDrainedPath = createPondPath([...nonDrainedTiles].map(([, XY]) => XY))
		// drainingTime += 6
		// // drain some amount, add to total drain if already draining
		// // only pick new pond if draining === 0
		// const originTile: XY = [Math.floor(x / 1.5), Math.floor(y)]
		// if (!tileGrids.has(xyToGrid(originTile))) return
		// drainingOrigin = originTile
		// const drainingTiles: Map<string, XY> = new Map()
		// const nonDrainingTiles: Map<string, XY> = new Map(
		// 	tiles.map((xy) => [xyToGrid(xy), xy])
		// )
		// // crawl from originTile to get all tiles in just this pond
		// drainingRadius = 0
		// const openTiles: Map<string, XY> = new Map([[xyToGrid(originTile), originTile]])
		// while (openTiles.size > 0) {
		// 	const [tileGrid, xy] = [...openTiles][0]
		// 	drainingTiles.set(tileGrid, xy)
		// 	openTiles.delete(tileGrid)
		// 	nonDrainingTiles.delete(tileGrid)
		// 	const distance = getDistance(xy[0] - originTile[0], xy[1] - originTile[1])
		// 	drainingRadius = Math.max(drainingRadius, distance + 1)
		// 	getNeighbors(...xy).forEach((nXY) => {
		// 		const nGrid = xyToGrid(nXY)
		// 		if (!drainingTiles.has(nGrid) && tileGrids.has(nGrid)) openTiles.set(nGrid, nXY)
		// 	})
		// }
		// drainingPath = createPondPath([...drainingTiles].map(([, XY]) => XY))
		// nonDrainingPath = createPondPath([...nonDrainingTiles].map(([, XY]) => XY))
		// await tick()
		// drainingGradientElement?.beginElement()
		// // TODO: Bug on samsung viewport, first sop doesn't animate
		// console.log(drainingGradientElement, drainingOrigin, drainingRadius)
	}

	async function onTiles() {
		previousPondPath = pondPath
		pondPath = createPondPath(tiles)
		tileGrids = new Set(tiles.map(xyToGrid)) // TODO: Don't need this anymore
		if (animate && previousPondPath !== pondPath && newTiles.length > 0) {
			dripsID++
			dripTiles = newTiles
				.map((_, i) => i)
				.filter((i) => i % (mini ? 2 : 3) === 0)
				.map((i) => newTiles[i])
			const delayCount = dripTiles.length - 1
			dripDelay = Math.round(Math.min(1500, delayCount * 100) / dripTiles.length)
			dripDuration = delay + 1000 + delayCount * dripDelay
			await tick()
			pondAnimateElement?.beginElement()
		}
	}

	$: if (tiles) onTiles()
</script>

{#if drainedTiles.length === 0}
	<clipPath id="pond_path"> <path d={pondPath} /> </clipPath>
	<clipPath id="prev_pond_path"> <path d={previousPondPath} /> </clipPath>
	<g clip-path="url(#pond_path)">
		{#key dripsID}
			{#each dripTiles as [x, y], t}
				<ellipse fill="var(--after-color)" cx={(x + 0.5) * 1.5} cy={y + 0.5}>
					<animate
						attributeName="rx"
						values="0;{mini ? 3 : 6}"
						calcMode="spline"
						fill="freeze"
						dur="1500ms"
						keySplines={bezierEasing.cubicOut}
						begin="pond_draw_animate_{dripsID}.begin+{delay + t * dripDelay + 'ms'}"
					/>
					<animate
						attributeName="ry"
						values="0;{mini ? 2 : 4}"
						calcMode="spline"
						fill="freeze"
						dur="1500ms"
						keySplines={bezierEasing.cubicOut}
						begin="pond_draw_animate_{dripsID}.begin+{delay + t * dripDelay + 'ms'}"
					/>
				</ellipse>
			{/each}
		{/key}
	</g>
	<g opacity={animate ? 1 : 0}>
		<g clip-path="url(#prev_pond_path)">
			<path fill="var(--landscape-color)" d={previousPondPath} />
			<path
				style:transform="translateY(0.2px)"
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
		{#if animate}
			<animate
				attributeName="opacity"
				values="1;1;0"
				begin="pond_draw_animate_{dripsID}.begin"
				dur="{dripDuration}ms"
				fill="freeze"
				keyTimes="0;1;1"
			/>
		{/if}
	</g>
	<g opacity={animate ? 0 : 1}>
		<g clip-path="url(#pond_path)">
			<path
				fill="var(--{forceColor ? 'after-color' : 'landscape-color'})"
				d={pondPath}
				style:transition="fill {forceColor ? 200 : 1000}ms ease"
			/>
			<path
				style:transform="translateY(0.2px)"
				fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
				stroke-width="0.2"
				stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
				style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
					? 200
					: 1000}ms ease"
				d={pondPath}
			/>
		</g>
		<!-- Main outline -->
		<path
			stroke-width="0.2"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			stroke-linecap="round"
			fill="none"
			style:transition="stroke {forceColor ? 200 : 1000}ms ease"
			d={pondPath}
		/>
		{#each floods as flood (flood)}
			<radialGradient
				id="pond_flood_gradient_{flood[0]}"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate({flood[1]} {flood[2]}) scale(1.5 1)"
				cx="0"
				cy="0"
				r={maxDistance}
			>
				<stop stop-color="var(--after-color)">
					<animate
						bind:this={flood[4]}
						id="pond_flood_animate_{flood[0]}"
						attributeName="offset"
						values="0;1;1;1"
						keyTimes={flood[5]}
						dur="{flood[3]}ms"
						fill="freeze"
						begin="indefinite"
					/>
				</stop>
				<stop stop-color="var(--after-color)" stop-opacity="0">
					<animate
						attributeName="offset"
						values="0;1.01;1.01;1.01"
						keyTimes={flood[5]}
						dur="{flood[3]}ms"
						fill="freeze"
						begin="pond_flood_animate_{flood[0]}.begin"
					/>
				</stop>
			</radialGradient>
			<path
				stroke-width="0.26"
				stroke-linecap="round"
				stroke="url('#pond_flood_gradient_{flood[0]}')"
				fill="url('#pond_flood_gradient_{flood[0]}')"
				d={pondPath}
			>
				<animate
					attributeName="opacity"
					values="1;1;1;0"
					keyTimes={flood[5]}
					calcMode="spline"
					keySplines="0 0 0 0;0 0 0 0;0.25 0.1 0.25 1"
					dur="{flood[3]}ms"
					fill="freeze"
					begin="pond_flood_animate_{flood[0]}.begin"
				/>
			</path>
		{/each}
		{#if animate && pondPath}
			{#key dripsID}
				<animate
					bind:this={pondAnimateElement}
					id="pond_draw_animate_{dripsID}"
					attributeName="opacity"
					values="0;0;1"
					dur="{dripDuration}ms"
					calcMode="spline"
					fill="freeze"
					keyTimes="0;{1 - 300 / dripDuration};1"
					keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicIn}"
					begin="indefinite"
				/>
			{/key}
		{/if}
	</g>
{:else}
	<!-- Draining -->
	<!-- <radialGradient
		id="pond_drain_gradient"
		gradientUnits="userSpaceOnUse"
		gradientTransform="translate({(drainingOrigin[0] + 0.5) * 1.5} {drainingOrigin[1] +
			0.5}) scale(1.5 1)"
		cx="0"
		cy="0"
		r={drainingRadius}
	>
		<stop stop-color="var(--after-color)">
			<animate
				bind:this={drainingGradientElement}
				id="pond_drain_animate"
				attributeName="offset"
				values="1;0"
				calcMode="spline"
				keySplines={bezierEasing.cubicOut}
				dur="{drainingRadius * 400}ms"
				fill="freeze"
				begin="indefinite"
			/>
		</stop>
		<stop stop-color="var(--after-color)" stop-opacity="0">
			<animate
				attributeName="offset"
				values="1.01;0"
				calcMode="spline"
				keySplines={bezierEasing.cubicOut}
				dur="{drainingRadius * 400}ms"
				fill="freeze"
				begin="pond_drain_animate.begin"
			/>
		</stop>
	</radialGradient> -->
	<!-- <clipPath id="draining_path"> <path d={drainedPath} /> </clipPath> -->
	<!-- <g clip-path="url(#draining_path)">
		<path
			fill="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={drainingPath}
			style:transition="fill {forceColor ? 200 : 1000}ms ease"
		/>
		<path
			style:transform="translateY(0.2px)"
			fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
			stroke-width="0.2"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={drainingPath}
		/>
	</g> -->
	<!-- <path
		stroke-width="0.2"
		stroke="url('#pond_drain_gradient')"
		stroke-linecap="round"
		fill="url('#pond_drain_gradient')"
		d={drainingPath}
	/> -->
	{#each drainedTiles as { xy, drainage }}
		{@const ry = (1 - drainage ** 3) * 0.5}
		<ellipse
			cx={(xy[0] + 0.5) * 1.5}
			cy={xy[1] + 0.5}
			rx={ry * 1.5}
			{ry}
			fill="var(--after-color)"
		/>
	{/each}

	<clipPath id="non_draining_path"> <path d={nonDrainedPath} /> </clipPath>
	<g clip-path="url(#non_draining_path)">
		<path
			fill="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonDrainedPath}
		/>
		<path
			style:transform="translateY(0.2px)"
			fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
			stroke-width="0.2"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonDrainedPath}
		/>
	</g>
	<path
		stroke-width="0.2"
		stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
		stroke-linecap="round"
		fill="none"
		d={nonDrainedPath}
	/>
{/if}
