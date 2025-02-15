<script lang="ts">
	import { bezierEasing } from '$lib/transitions'
	import { getDistance, getNeighbors, xyToGrid, type XY } from '$lib/math'
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

	let nonDrainedPath: string

	const iceTilesMap: Map<string, XY> = new Map()
	let iceTiles: XY[] = []
	let icePath: string
	let iceShelfPaths: string[]
	const emptyTilesMap: Map<string, XY> = new Map()
	let emptyPath: string

	type IceShard = {
		xy: XY
		height: number
	}

	let iceShards: IceShard[] = []

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
		if (clickedTile) {
			if (iceTilesMap.has(clickedTile.grid)) {
				// TODO: Crawl to break nearby (and connected) ice
				emptyTilesMap.set(clickedTile.grid, clickedTile.xy)
				iceTilesMap.delete(clickedTile.grid)
			} else {
				// const newIceTiles: Map<string, XY> = new Map()
				const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
				const newIceShards: IceShard[] = []
				while (openTiles.size > 0) {
					const [grid, xy] = [...openTiles][0]
					openTiles.delete(grid)
					iceTilesMap.set(grid, xy)
					// newIceTiles.set(grid, xy)
					// newIceShards.push({ xy: [xy[0] * 15, xy[1] * 10], height: randomInt(0, 6) })
					// newIceShards.push({ xy: [xy[0] * 15 + 8, xy[1] * 10], height: randomInt(0, 6) })
					// newIceShards.push({
					// 	xy: [xy[0] * 15 + 4, xy[1] * 10 + 5],
					// 	height: randomInt(0, 6),
					// })
					// newIceShards.push({
					// 	xy: [xy[0] * 15 + 12, xy[1] * 10 + 5],
					// 	height: randomInt(0, 6),
					// })
					getNeighbors(...xy).forEach((nXY) => {
						const nGrid = xyToGrid(nXY)
						if (!iceTilesMap.has(nGrid) && tilesMap.has(nGrid)) openTiles.set(nGrid, nXY)
					})
				}
				iceShards = [...iceShards, ...newIceShards]
				// TODO: Radial gradient of ice expands, as shards fade in on edges
				// Maybe make entire frozen pond be jagged, with visible chunks to break
			}
		}
		// TODO: Subtle white dots on ice?
		// TODO: Refactor this
		const nonDrainedTiles: Map<string, XY> = new Map(
			[...tilesMap.entries()].filter(
				([grid]) => !emptyTilesMap.has(grid) && !iceTilesMap.has(grid)
			)
		)
		nonDrainedPath = stringifyPathData(createPondPath([...nonDrainedTiles.values()]))
		iceTiles = [...iceTilesMap.values()]
		const emptyTiles = [...emptyTilesMap.values()]
		const icePaths = createFrozenPondPaths(iceTiles, emptyTiles, answer)
		icePath = stringifyPathData(icePaths.mainPath)
		iceShelfPaths = icePaths.shelfPaths.map((p) => stringifyPathData(p))
		// emptyPath = createPondPath(emptyTiles)
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
{#if iceTiles.length === 0}
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
		<g clip-path="url(#prev_pond_path)">
			<path fill="var(--landscape-color)" d={previousPondPath} />
			<path
				style:transform="translateY(2px)"
				fill="var(--tertiary-color)"
				stroke-width="2"
				stroke="var(--landscape-color)"
				d={previousPondPath}
			/>
		</g>
		<path
			stroke-width="2"
			stroke="var(--landscape-color)"
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
				style:transform="translateY(2px)"
				fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
				stroke-width="2"
				stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
				style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
					? 200
					: 1000}ms ease"
				d={pondPath}
			/>
		</g>
		<!-- Main outline -->
		<path
			stroke-width="2"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			fill="none"
			style:transition="stroke {forceColor ? 200 : 1000}ms ease"
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
				stroke-width="2.6"
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
		fill="url('#pond_drain_gradient')"
		d={drainingPath}
	/> -->
	<g clip-path="url(#pond_path)">
		<path d={pondPath} fill={$highContrast ? '#000' : '#0008'} />
		<path
			opacity="0.6"
			d={pondPath}
			fill={'var(--tertiary-color)'}
			style:transform="translateY(3.5px)"
		/>
		{#each iceShelfPaths as shelfPath (shelfPath)}
			<path
				stroke-width="0.2"
				stroke-linejoin="round"
				stroke="#56A9FF"
				fill="#56A9FF"
				d={shelfPath}
				style:transition="fill {forceColor ? 200 : 1000}ms ease"
			/>
		{/each}
	</g>

	<clipPath id="non_drained_clip"> <path d={nonDrainedPath} /> </clipPath>
	<g clip-path="url(#non_drained_clip)">
		<path
			fill="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonDrainedPath}
			style:transition="fill {forceColor ? 200 : 1000}ms ease"
		/>
		<path
			style:transform="translateY(2px)"
			fill="var(--{forceColor ? 'after-color' : 'tertiary-color'})"
			stroke-width="2"
			stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
			d={nonDrainedPath}
			style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
				? 200
				: 1000}ms ease"
		/>
	</g>
	<path
		stroke-width="2"
		stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
		fill="none"
		d={nonDrainedPath}
		style:transition="stroke {forceColor ? 200 : 1000}ms ease"
	/>
	<!-- <clipPath id="empty-clip">
		<path
			d="{emptyPath} M-1,-1 H{landscapeWidth * 15 + 1} V{landscapeHeight * 10 + 1} H-1 z"
		/>
	</clipPath> -->
	<path
		stroke-width="0.2"
		stroke-linejoin="round"
		stroke="#B2CFFF"
		fill="#B2CFFF"
		d={icePath}
		style:transition="fill {forceColor ? 200 : 1000}ms ease"
	/>

	{#each iceShards as { xy: [x, y], height }}
		<path stroke="#8afa" fill="#8afa" d="M{x - 3},{y + 1} l4,-2 l4,2 v3 l-4,2 l-4,-2 z" />
	{/each}
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
