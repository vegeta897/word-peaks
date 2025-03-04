<script lang="ts">
	import { bezierEasing } from '$lib/transitions'
	import {
		getDistance,
		getDistanceBetween,
		getManhattanDistanceBetween,
		getNeighbors,
		randomFloat,
		xyToGrid,
		type XY,
	} from '$lib/math'
	import { tick } from 'svelte'
	import { createFrozenPondPaths, createPondPath } from '$lib/landscape/pond'
	import { highContrast } from '$src/store'
	import { stringifyPathData } from '$lib/paths'

	export let tiles: XY[] = []
	export let newTiles: XY[] = []
	export let animate: boolean
	export let delay: number
	export let landscapeWidth: number
	export let landscapeHeight: number
	export let mini = false
	export let forceColor: boolean
	export let answer: string

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
	let tilesMap: Map<string, XY>

	let dripTiles: XY[] = []
	let dripsID = 0
	let dripDelay: number
	let dripDuration: number
	let pondAnimateElement: SVGAnimateElement

	// TODO: Move frozen pond stuff into child component

	let havingFun = false
	let nonFrozenTilesMap: Map<string, XY>
	let nonFrozenPath: string
	type FrozenPond = {
		radius: number
		origin: XY
		gradientElement: SVGAnimateElement | null
		tilesMap: Map<string, XY>
		emptyTilesMap: Map<string, XY>
		path: string
		shelfPaths: string[]
	}
	let frozenPonds: FrozenPond[] = []
	const emptyTilesMap: Map<string, XY> = new Map()

	// type IceShard = {
	// 	xy: XY
	// 	height: number
	// }

	// let iceShards: IceShard[] = []

	export async function doFun(x: number, y: number) {
		const normalizedX = x / 10 / 1.5
		const normalizedY = y / 10
		let clickedTile: null | { grid: string; xy: XY; distance: number } = null
		for (
			let nearX = Math.floor(normalizedX - 0.2);
			nearX <= Math.floor(normalizedX + 0.2);
			nearX++
		) {
			for (
				let nearY = Math.floor(normalizedY - 0.3);
				nearY <= Math.floor(normalizedY + 0.3);
				nearY++
			) {
				const nearXY: XY = [nearX, nearY]
				const nearGrid = xyToGrid(nearXY)
				if (emptyTilesMap.has(nearGrid) || !tilesMap.has(nearGrid)) continue
				const distance = getDistance(nearX + 0.5 - normalizedX, nearY + 0.5 - normalizedY)
				if (!clickedTile || distance < clickedTile.distance) {
					clickedTile = { grid: nearGrid, xy: nearXY, distance }
				}
			}
		}
		if (!clickedTile) return
		if (!havingFun) {
			havingFun = true
			nonFrozenTilesMap = new Map(tilesMap)
		}
		const clickedFrozenPond = frozenPonds.find((f) => f.tilesMap.has(clickedTile.grid))
		if (clickedFrozenPond) {
			// TODO: Don't crawl if clicking and dragging
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				clickedFrozenPond.emptyTilesMap.set(grid, xy)
				clickedFrozenPond.tilesMap.delete(grid)
				getNeighbors(...xy).forEach((nXY) => {
					const neighborGrid = xyToGrid(nXY)
					if (!clickedFrozenPond.tilesMap.has(neighborGrid)) return
					const neighborAlone = !getNeighbors(...nXY).some((nnXY) =>
						clickedFrozenPond.tilesMap.has(xyToGrid(nnXY))
					)
					if (neighborAlone) {
						clickedFrozenPond.emptyTilesMap.set(neighborGrid, nXY)
						clickedFrozenPond.tilesMap.delete(neighborGrid)
					} else {
						const distance = getManhattanDistanceBetween(clickedTile.xy, nXY)
						if (distance > randomFloat(2, 4)) return
						openTiles.set(neighborGrid, nXY)
					}
				})
			}
			updateFrozenPond(clickedFrozenPond)
			clickedFrozenPond.emptyTilesMap.forEach((v, k) => emptyTilesMap.set(k, v))
			frozenPonds = [...frozenPonds]
		} else {
			// const newIceTiles: Map<string, XY> = new Map()
			const freezingPond: FrozenPond = {
				radius: 1,
				origin: [x, y],
				gradientElement: null,
				tilesMap: new Map(),
				emptyTilesMap: new Map(),
				path: '',
				shelfPaths: [],
			}
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			// const newIceShards: IceShard[] = []
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				nonFrozenTilesMap.delete(grid)
				freezingPond.tilesMap.set(grid, xy)
				const distance = getDistanceBetween(clickedTile.xy, xy)
				freezingPond.radius = Math.max(freezingPond.radius, distance + 1)
				getNeighbors(...xy).forEach((nXY) => {
					const nGrid = xyToGrid(nXY)
					if (!freezingPond.tilesMap.has(nGrid) && nonFrozenTilesMap.has(nGrid))
						openTiles.set(nGrid, nXY)
				})
			}
			updateFrozenPond(freezingPond)
			frozenPonds = [...frozenPonds, freezingPond]
			// iceShards = [...iceShards, ...newIceShards]
			tick().then(() => freezingPond.gradientElement?.beginElement())
			// Maybe make entire frozen pond be jagged, with visible chunks to break
			nonFrozenPath = stringifyPathData(createPondPath([...nonFrozenTilesMap.values()]))
		}
		// TODO: Subtle white dots on ice?
	}

	function updateFrozenPond(frozenPond: FrozenPond) {
		const { mainPath, shelfPaths } = createFrozenPondPaths(
			[...frozenPond.tilesMap.values()],
			[...frozenPond.emptyTilesMap.values()],
			answer
		)
		frozenPond.path = stringifyPathData(mainPath)
		frozenPond.shelfPaths = shelfPaths.map((p) => stringifyPathData(p))
	}

	async function onTiles() {
		previousPondPath = pondPath
		pondPath = stringifyPathData(createPondPath(tiles))
		tilesMap = new Map(tiles.map((xy) => [xyToGrid(xy), xy]))
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

<clipPath id="pond_path"> <path d={pondPath} /> </clipPath>
{#if !havingFun}
	<clipPath id="prev_pond_path"> <path d={previousPondPath} /> </clipPath>
	<g clip-path="url(#pond_path)">
		{#key dripsID}
			{#each dripTiles as [x, y], t}
				<ellipse fill="var(--after-color)" cx={(x * 10 + 5) * 1.5} cy={y * 10 + 5}>
					<animate
						attributeName="rx"
						values="0;{mini ? 30 : 60}"
						calcMode="spline"
						fill="freeze"
						dur="1500ms"
						keySplines={bezierEasing.cubicOut}
						begin="pond_draw_animate_{dripsID}.begin+{delay + t * dripDelay + 'ms'}"
					/>
					<animate
						attributeName="ry"
						values="0;{mini ? 20 : 40}"
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
		<!-- Expanding ponds -->
		<g clip-path="url(#prev_pond_path)">
			<path fill="var(--landscape-color)" d={previousPondPath} />
			<path
				style:transform="translateY(2px)"
				fill="var(--tertiary-color)"
				stroke-width="3"
				stroke="var(--landscape-color)"
				d={previousPondPath}
			/>
			<path
				stroke-width="3"
				stroke="var(--landscape-color)"
				fill="none"
				d={previousPondPath}
			/>
		</g>
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
		<!-- Static ponds -->
		<g clip-path="url(#pond_path)">
			<path fill="var(--landscape-color)" d={pondPath} />
			<path
				style:transform="translateY(2px)"
				fill="var(--tertiary-color)"
				stroke-width="3"
				stroke="var(--landscape-color)"
				d={pondPath}
			/>
			<path stroke-width="3" stroke="var(--landscape-color)" fill="none" d={pondPath} />
		</g>
		<path
			stroke-width="0.3"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			fill={forceColor ? 'var(--after-color)' : '#fff0'}
			style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
				? 200
				: 1000}ms ease"
			d={pondPath}
		/>
		{#each floods as flood (flood)}
			<radialGradient
				id="pond_flood_gradient_{flood[0]}"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate({flood[1]} {flood[2]}) scale(15 10)"
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
				stroke-width="0.5"
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
	<!-- Freezing -->
	<path d={pondPath} fill={$highContrast ? '#000' : '#0008'} />
	<path
		d={pondPath}
		opacity="0.6"
		fill="var(--tertiary-color)"
		style:transform="translateY(3.5px)"
	/>
	{#each frozenPonds as { radius, origin, gradientElement, path, shelfPaths }, f (f)}
		<radialGradient
			id="pond_freeze_gradient_{f}"
			gradientUnits="userSpaceOnUse"
			gradientTransform="translate({origin[0]} {origin[1]}) scale(15 10)"
			cx="0"
			cy="0"
			r={radius}
		>
			<stop stop-color="#B2CFFF">
				<animate
					bind:this={gradientElement}
					id="pond_freeze_animate_{f}"
					attributeName="offset"
					values="0;0;1"
					calcMode="spline"
					keySplines="{bezierEasing.cubicIn};{bezierEasing.cubicOut}"
					keyTimes="0;{1 / (1 + radius)};1"
					dur="{(radius + 1) * 70}ms"
					fill="freeze"
					begin="indefinite"
				/>
			</stop>
			<stop stop-color="var(--after-color)">
				<animate
					attributeName="offset"
					values="0;1.01"
					calcMode="spline"
					keySplines={bezierEasing.cubicOut}
					dur="{radius * 70}ms"
					fill="freeze"
					begin="pond_freeze_animate_{f}.begin"
				/>
			</stop>
		</radialGradient>
		<g clip-path="url(#pond_path)">
			{#each shelfPaths as shelfPath (shelfPath)}
				<path
					stroke-width="0.2"
					stroke-linejoin="round"
					stroke={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
					fill={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
					d={shelfPath}
					style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
						? 200
						: 1000}ms ease"
				/>
			{/each}
		</g>
		<path
			stroke-width="0.2"
			stroke="url('#pond_freeze_gradient_{f}')"
			fill="url('#pond_freeze_gradient_{f}')"
			d={path}
		/>
	{/each}
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
	<clipPath id="non_frozen_clip"> <path d={nonFrozenPath} /> </clipPath>
	<g clip-path="url(#non_frozen_clip)">
		<path
			fill="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonFrozenPath}
			style:transition="fill {forceColor ? 200 : 1000}ms ease"
		/>
		<path
			style:transform="translateY(2px)"
			fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
			stroke-width="3"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonFrozenPath}
			style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
				? 200
				: 1000}ms ease"
		/>
		<path
			stroke-width="3"
			stroke="var(--landscape-color)"
			fill="none"
			d={nonFrozenPath}
		/>
	</g>
	<path
		stroke-width="0.3"
		stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
		fill={forceColor ? 'var(--after-color)' : '#fff0'}
		d={nonFrozenPath}
		style:transition="stroke {forceColor ? 200 : 1000}ms ease"
	/>
	<!-- <clipPath id="empty-clip">
		<path
			d="{emptyPath} M-1,-1 H{landscapeWidth * 15 + 1} V{landscapeHeight * 10 + 1} H-1 z"
		/>
	</clipPath> -->
	<!-- <path
		stroke-width="0.2"
		stroke-linejoin="round"
		stroke={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
		fill={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
		d={icePath}
		style:transition="fill {forceColor ? 200 : 1000}ms ease"
	/> -->

	<!-- {#each iceShards as { xy: [x, y], height }}
		<path stroke="#8afa" fill="#8afa" d="M{x - 3},{y + 1} l4,-2 l4,2 v3 l-4,2 l-4,-2 z" />
	{/each} -->
	<!-- <clipPath id="empty-clip-2"> <path d={emptyPath} /> </clipPath>
	<g clip-path="url(#empty-clip-2)">
		<path
			stroke-width="2"
			stroke="var(--landscape-color)"
			fill="none"
			d={emptyPath}
			style:transform="translateY(1.8px)"
		/>
	</g>
	<path stroke-width="2" stroke="var(--landscape-color)" fill="none" d={emptyPath} /> -->
	<!-- <path
		stroke-width="2"
		stroke="var(--landscape-color)"
		fill="#0008"
		d={emptyPath}
		style:transition="stroke {forceColor ? 200 : 1000}ms ease"
	/>
	<path clip-path="url(#test-clip)" fill="#35f" d="M5,30 h40 v40 h-40 z" /> -->
{/if}
