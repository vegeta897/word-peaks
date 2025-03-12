<script lang="ts">
	import { bezierEasing } from '$lib/animation'
	import {
		getDistance,
		getDistanceBetween,
		getManhattanDistanceBetween,
		getNeighbors8,
		randomFloat,
		randomInt,
		xyToGrid,
		type XY,
	} from '$lib/math'
	import { tick } from 'svelte'
	import { createPondPath, createSubTilePath } from '$lib/landscape/pond'
	import { highContrast } from '$src/store'
	import { stringifyPathData } from '$lib/paths'
	import { cubicIn } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import Rand from 'rand-seed'

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
	let lastFreeze = 0
	$: freezeDelay =
		frozenPonds.length > 0 ? frozenPonds[frozenPonds.length - 1].freezeDelay : 0
	type FrozenPond = {
		freezeDelay: number
		radius: number
		origin: XY
		gradientElement: SVGAnimateElement | null
		tiles: Map<string, { xy: XY; subTiles: Map<string, SubTile> }>
		emptyTiles: Map<string, XY>
		path: string
		shelfPath: string
		subTiles: Map<string, SubTile>
		subTileVertices: Map<string, XY>
		brokenPath: string
		animatedBreaks: {
			mainPaths: string[]
			shelfPaths: string[]
			timing: number[]
			duration: number
			breakAnimateElement: SVGAnimateElement | null
		}[]
	}
	type SubTile = { subTileXY: XY; tileGrids: Set<string> }
	let frozenPonds: FrozenPond[] = []
	const emptyTilesMap: Map<string, XY> = new Map()

	type IceShard = {
		xy: XY
		origin: XY
		rotation: number
		velocity: XY
		delay: number
		duration: number
		points: [XY, XY, XY, XY]
	}

	let iceShardLayers: IceShard[][] = []

	export async function doFun(x: number, y: number) {
		const normalizedXY: XY = [x / 10 / 1.5, y / 10]
		let clickedTile: null | { grid: string; xy: XY; distance: number } = null
		for (
			let nearX = Math.floor(normalizedXY[0] - 0.3);
			nearX <= Math.floor(normalizedXY[0] + 0.3);
			nearX++
		) {
			for (
				let nearY = Math.floor(normalizedXY[1] - 0.4);
				nearY <= Math.floor(normalizedXY[1] + 0.4);
				nearY++
			) {
				const nearXY: XY = [nearX, nearY]
				const nearGrid = xyToGrid(nearXY)
				if (emptyTilesMap.has(nearGrid) || !tilesMap.has(nearGrid)) continue
				const distance = getDistanceBetween([nearX + 0.5, nearY + 0.5], normalizedXY)
				if (!clickedTile || distance < clickedTile.distance) {
					clickedTile = { grid: nearGrid, xy: nearXY, distance }
				}
			}
		}
		if (!clickedTile) return
		let firstFun = !havingFun
		if (firstFun) {
			havingFun = true
			nonFrozenTilesMap = new Map(tilesMap)
		}
		const clickedFrozenPond = frozenPonds.find((f) => f.tiles.has(clickedTile.grid))
		if (clickedFrozenPond) {
			// TODO: Don't crawl if clicking and dragging
			if (Date.now() < lastFreeze + clickedFrozenPond.freezeDelay) return
			const breakableSubTiles: Map<string, SubTile> = new Map()
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				clickedFrozenPond.tiles
					.get(grid)!
					.subTiles.forEach((st, g) => breakableSubTiles.set(g, st))
				breakIce(clickedFrozenPond, grid, xy, normalizedXY)
				getNeighbors8(...xy).forEach((nXY, n) => {
					const neighborGrid = xyToGrid(nXY)
					if (openTiles.has(neighborGrid) || !clickedFrozenPond.tiles.has(neighborGrid))
						return
					const neighborAlone = !getNeighbors8(...nXY).some((nnXY) =>
						clickedFrozenPond.tiles.has(xyToGrid(nnXY))
					)
					if (neighborAlone) {
						clickedFrozenPond.tiles
							.get(neighborGrid)!
							.subTiles.forEach((st, g) => breakableSubTiles.set(g, st))
						breakIce(clickedFrozenPond, neighborGrid, nXY, normalizedXY)
					} else {
						const distance = getDistanceBetween(clickedTile.xy, nXY)
						if (distance > randomFloat(1.75, 2.5)) return
						openTiles.set(neighborGrid, nXY)
					}
				})
			}
			const breakSections: XY[][] = []
			breakableSubTiles.forEach((subTile, subTileGrid) => {
				const willBreak = [...subTile.tileGrids].every(
					(tg) => !clickedFrozenPond.tiles.has(tg)
				)
				if (willBreak) {
					clickedFrozenPond.subTiles.delete(subTileGrid)
					const [x, y] = subTile.subTileXY
					let layer = iceShardLayers[y]
					if (!layer) {
						layer = []
						iceShardLayers[y] = layer
					}
					const points: [XY, XY, XY, XY] = [
						clickedFrozenPond.subTileVertices.get(xyToGrid(subTile.subTileXY))!,
						clickedFrozenPond.subTileVertices.get(xyToGrid([x + 1, y]))!,
						clickedFrozenPond.subTileVertices.get(xyToGrid([x + 1, y + 1]))!,
						clickedFrozenPond.subTileVertices.get(xyToGrid([x, y + 1]))!,
					]
					const distance = getDistanceBetween([x / 2, y / 2], normalizedXY)
					// TODO: Detect subTiles on pond edges/corners, so they can be reduced in size
					// layer.push({
					// 	xy: subTile.subTileXY,
					// 	origin: [
					// 		(points[0][0] + points[2][0]) / 2,
					// 		(points[0][1] + points[2][1]) / 2,
					// 	],
					// 	rotation: 0,
					// 	velocity: [0, 0],
					// 	delay: distance * 300,
					// 	duration: 0,
					// 	points,
					// })
					const sectionIndex = Math.round(distance * 2)
					breakSections[sectionIndex] = [
						...(breakSections[sectionIndex] || []),
						subTile.subTileXY,
					]
				}
			})
			const animatedBreak: FrozenPond['animatedBreaks'][number] = {
				mainPaths: [],
				shelfPaths: [],
				timing: [],
				duration: breakSections.length * 70,
				breakAnimateElement: null,
			}
			// const cumulativeBreakArea: XY[] = []
			for (let i = 1; i < breakSections.length; i++) {
				if (!breakSections[i]) continue
				// cumulativeBreakArea.push(...breakSections[i])
				const unbrokenArea = breakSections[i].concat(...breakSections.slice(i + 1))
				const { mainPath, shelfPath } = createSubTilePath(
					unbrokenArea,
					clickedFrozenPond.subTileVertices
				)
				animatedBreak.mainPaths.push(stringifyPathData(mainPath))
				animatedBreak.shelfPaths.push(stringifyPathData(shelfPath))
				animatedBreak.timing.push(cubicIn((i - 1) / (breakSections.length - 1)))
			}
			animatedBreak.mainPaths.push('Z')
			animatedBreak.shelfPaths.push('Z')
			animatedBreak.timing.push(1)
			clickedFrozenPond.animatedBreaks.push(animatedBreak)
			tick().then(() => animatedBreak.breakAnimateElement?.beginElement())
			// TODO: Store all broken subTiles on pond object (why?)
			const { mainPath, shelfPath } = createSubTilePath(
				[...clickedFrozenPond.subTiles.values()].map((st) => st.subTileXY),
				clickedFrozenPond.subTileVertices
			)
			clickedFrozenPond.brokenPath = stringifyPathData(mainPath)
			clickedFrozenPond.shelfPath = stringifyPathData(shelfPath)
			// updateFrozenPond(clickedFrozenPond)
			clickedFrozenPond.emptyTiles.forEach((v, k) => emptyTilesMap.set(k, v))
			frozenPonds = frozenPonds // Reactivity
			iceShardLayers = iceShardLayers // Reactivity
		} else {
			// Freeze a pond
			lastFreeze = Date.now()
			const freezingPond: FrozenPond = {
				freezeDelay: 0,
				radius: 1,
				origin: [x, y],
				gradientElement: null,
				tiles: new Map(),
				emptyTiles: new Map(),
				path: '',
				shelfPath: '',
				subTiles: new Map(),
				subTileVertices: new Map(),
				brokenPath: '',
				animatedBreaks: [],
			}
			const tileList: XY[] = []
			const rng = new Rand(answer + clickedTile.grid)
			const getRng = () => rng.next()
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				nonFrozenTilesMap.delete(grid)
				const subTiles: Map<string, SubTile> = new Map()
				freezingPond.tiles.set(grid, { subTiles, xy })
				tileList.push(xy)
				for (let fxi = 0; fxi < 4; fxi++) {
					const xDir = fxi % 2 ? 1 : -1
					const subPointX = xy[0] * 2 + fxi
					for (let fyi = 0; fyi < 4; fyi++) {
						const yDir = fyi % 2 ? 1 : -1
						const subPointY = xy[1] * 2 + fyi
						const subPointGrid = xyToGrid([subPointX, subPointY])
						let fracturePoint = freezingPond.subTileVertices.get(subPointGrid)
						if (!fracturePoint) {
							fracturePoint = [(subPointX - 0.5) / 2, (subPointY - 0.5) / 2]
							const onTileGrid = xyToGrid([
								Math.floor(fracturePoint[0]),
								Math.floor(fracturePoint[1]),
							])
							const maxJitter = tilesMap.has(onTileGrid) ? 0.2 : 0.1
							fracturePoint[0] += randomFloat(0, maxJitter, getRng) * xDir * yDir
							fracturePoint[1] += randomFloat(0, maxJitter, getRng) * xDir * yDir
							freezingPond.subTileVertices.set(subPointGrid, fracturePoint)
						}
						if (fxi > 0 && fyi > 0) {
							const subTileXY: XY = [subPointX - 1, subPointY - 1]
							const subTileGrid = xyToGrid(subTileXY)
							let subTile = freezingPond.subTiles.get(subTileGrid)
							if (!subTile) {
								subTile = {
									subTileXY,
									tileGrids: new Set([grid]),
								}
								freezingPond.subTiles.set(subTileGrid, subTile)
							} else {
								subTile.tileGrids.add(grid)
							}
							subTiles.set(subTileGrid, subTile)
						}
					}
				}
				const distance = getDistanceBetween(normalizedXY, [xy[0] + 0.5, xy[1] + 0.5])
				freezingPond.radius = Math.max(freezingPond.radius, distance + 1)
				getNeighbors8(...xy).forEach((nXY) => {
					const nGrid = xyToGrid(nXY)
					if (!freezingPond.tiles.has(nGrid) && nonFrozenTilesMap.has(nGrid))
						openTiles.set(nGrid, nXY)
				})
			}
			const freezingPondPathData = createPondPath(tileList)
			freezingPond.path = stringifyPathData(freezingPondPathData)
			// console.log(freezingPond.subTiles)
			// updateFrozenPond(freezingPond)
			frozenPonds = [...frozenPonds, freezingPond]
			// Draw all ponds as non-frozen first so we can transition them away
			if (firstFun) nonFrozenPath = pondPath
			freezingPond.freezeDelay = (freezingPond.radius + 1) * 60
			tick().then(() => {
				freezingPond.gradientElement?.beginElement()
				nonFrozenPath = stringifyPathData(createPondPath([...nonFrozenTilesMap.values()]))
			})
		}
	}

	function breakIce(pond: FrozenPond, tileGrid: string, tileXY: XY, clickXY: XY) {
		pond.emptyTiles.set(tileGrid, tileXY)
		pond.tiles.delete(tileGrid)
		// TODO: Animate an inverted clip path for frozen pond breaking away as shards are spawned
		// TODO: Need to get these in the right z-order amidst other landscape features
		// TODO: Expanding transparent gradient on broken ice sections
		// TODO: Shards will have to be invisible during delay, since they will render above the frozen pond
		// TODO: Delete shards after max delay+duration
		// for (let i = 0; i < 9; i++) {
		// 	const shardX = xy[0] + (i % 3) / 3
		// 	const shardY = xy[1] + Math.floor(i / 3) / 3
		// 	const normalizedDistance = getDistanceBetween([shardX, shardY], clickXY) / 5
		// 	const delay = Math.floor(circIn(Math.min(1, normalizedDistance)) * 500)
		// 	iceShards.push({
		// 		xy: [shardX * 15, shardY * 10],
		// 		rotation: randomFloat(-1, 1),
		// 		velocity: [randomFloat(-1, 1), randomFloat(0.5, 1)],
		// 		delay,
		// 		duration: randomInt(400, 650),
		// 	})
		// }
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
				stroke-width="2"
				stroke="var(--landscape-color)"
				d={previousPondPath}
			/>
			<path
				stroke-width="2"
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
		{#if !forceColor}
			<g clip-path="url(#pond_path)" out:fade|local={{ duration: 200 }}>
				<path fill="var(--landscape-color)" d={pondPath} />
				<path
					style:transform="translateY(2px)"
					fill="var(--tertiary-color)"
					stroke="var(--landscape-color)"
					stroke-width="2"
					d={pondPath}
				/>
				<path fill="none" stroke="var(--landscape-color)" stroke-width="2" d={pondPath} />
			</g>
		{/if}
		<path
			fill={forceColor ? 'var(--after-color)' : '#fff0'}
			style:transition="fill {forceColor ? 200 : 1000}ms ease"
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
				stroke-width="0.25"
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
	<!-- Fun -->
	<path d={pondPath} fill={$highContrast ? '#000' : '#0008'} />
	<path
		d={pondPath}
		opacity="0.6"
		fill="var(--tertiary-color)"
		style:transform="translateY(3.5px)"
	/>
	{#key nonFrozenPath}
		<g out:fade|local={{ delay: freezeDelay, duration: 0 }}>
			<clipPath id="non_frozen_clip"> <path d={nonFrozenPath} /> </clipPath>
			{#if !forceColor}
				<g clip-path="url(#non_frozen_clip)" out:fade|local={{ duration: 200 }}>
					<path fill="var(--landscape-color)" d={nonFrozenPath} />
					<path
						style:transform="translateY(2px)"
						fill="var(--tertiary-color)"
						stroke="var(--landscape-color)"
						stroke-width="2"
						d={nonFrozenPath}
					/>
					<path
						fill="none"
						stroke="var(--landscape-color)"
						stroke-width="2"
						d={nonFrozenPath}
					/>
				</g>
			{/if}
			<path
				fill={forceColor ? 'var(--after-color)' : '#fff0'}
				d={nonFrozenPath}
				style:transition="fill {forceColor ? 200 : 1000}ms ease"
			/>
		</g>
	{/key}
	{#each frozenPonds as { radius, origin, freezeDelay, gradientElement, path, shelfPath, subTiles, subTileVertices, brokenPath, tiles, animatedBreaks }, f (f)}
		<radialGradient
			id="pond_freeze_gradient_{f}"
			gradientUnits="userSpaceOnUse"
			gradientTransform="translate({origin[0]} {origin[1]}) scale(15 10)"
			cx="0"
			cy="0"
			r={radius}
		>
			<stop
				stop-color={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
				style:transition="stop-color {forceColor ? 200 : 1000}ms ease"
			>
				<animate
					bind:this={gradientElement}
					id="pond_freeze_animate_{f}"
					attributeName="offset"
					values="0;0;1"
					calcMode="spline"
					keySplines="{bezierEasing.sineIn};{bezierEasing.sineOut}"
					keyTimes="0;{1 / (1 + radius)};1"
					dur="{freezeDelay}ms"
					fill="freeze"
					begin="indefinite"
				/>
			</stop>
			<stop stop-color={forceColor ? '#B2CFFF00' : '#fff0'}>
				<animate
					attributeName="offset"
					values="0;1.01"
					calcMode="spline"
					keySplines={bezierEasing.sineOut}
					dur="{radius * 60}ms"
					fill="freeze"
					begin="pond_freeze_animate_{f}.begin"
				/>
			</stop>
		</radialGradient>
		<g clip-path="url(#pond_path)">
			<path
				stroke-width="0.25"
				stroke-linejoin="round"
				stroke={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
				fill={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
				d={shelfPath}
				style:transition="fill {forceColor ? 200 : 1000}ms ease, stroke {forceColor
					? 200
					: 1000}ms ease"
			/>
			{#each animatedBreaks as { mainPaths, shelfPaths, timing, duration, breakAnimateElement }, b (b)}
				<path
					stroke-width="0.25"
					stroke-linejoin="round"
					stroke={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
					fill={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
				>
					<animate
						attributeName="d"
						id="pond_break_animate_{f}_{b}"
						bind:this={breakAnimateElement}
						values={shelfPaths.join(';')}
						keyTimes={timing.join(';')}
						calcMode="discrete"
						dur="{duration}ms"
						fill="freeze"
						begin="indefinite"
					/>
				</path>
				<path
					stroke-width="0.25"
					stroke-linejoin="round"
					stroke={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
					fill={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
				>
					<animate
						attributeName="d"
						values={mainPaths.join(';')}
						keyTimes={timing.join(';')}
						calcMode="discrete"
						dur="{duration}ms"
						fill="freeze"
						begin="pond_break_animate_{f}_{b}.begin"
					/>
				</path>
			{/each}
		</g>
		<clipPath id="broken_path_{f}"> <path d={brokenPath} /> </clipPath>
		<path
			clip-path={brokenPath || tiles.size === 0 ? `url(#broken_path_${f}` : 'none'}
			stroke-width="0.25"
			stroke-linejoin="round"
			stroke="url('#pond_freeze_gradient_{f}')"
			fill="url('#pond_freeze_gradient_{f}')"
			d={path}
		/>
		<!-- {#each animatedBreakPaths as bp}
				<path fill="#f441" d={bp} />
			{/each} -->
		<!-- {#each [...subTiles.values()] as { subTileXY: [x, y] }}
			{@const points = [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
			].map(([nx, ny]) =>
				subTileVertices.get(x + nx + ':' + (y + ny))?.map((v, i) => v * (i ? 10 : 15))
			)}
			<path
				stroke="#99BEFD20"
				stroke-width="0.3"
				fill="none"
				d="M{points[0]} L{points[1]} L{points[2]} L{points[3]} Z"
			/>
		{/each} -->
		<!-- {#each [...subPoints.values()] as [fx, fy]}
			<circle fill="#00f" cx={fx * 15} cy={fy * 10} r="0.3" />
		{/each} -->
	{/each}
	<!-- Don't use pond-clip on these, it creates large rasterized areas -->
	{#each iceShardLayers as iceShardLayer, i (i)}
		{#if iceShardLayer}
			{#each iceShardLayer as { xy, origin, rotation, velocity, delay, duration, points }}
				{@const p = points.map(([x, y]) => [x * 15, y * 10])}
				<path
					class="rotate"
					stroke={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
					stroke-width="0.5"
					stroke-linejoin="round"
					fill={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
					d="M{p[0][0]},{p[0][1]} L{p[1][0]},{p[1][1]} {p[2][0]},{p[2][1]} {p[3][0]},{p[3][1]} Z"
					style:transform-origin="{origin[0] * 15}px {origin[1] * 10}px"
					style:animation-delay="{delay}ms"
				/>
			{/each}
		{/if}
	{/each}
{/if}

<style>
	.ice-shard-container {
		animation: transform-from-init cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	.ice-shard {
		animation: transform-from-init linear both, fade ease-in both;
	}

	.rotate {
		animation: rotate 3s infinite linear;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes transform-from-init {
		0% {
			transform: none;
		}
	}

	@keyframes fade {
		100% {
			opacity: 0;
		}
	}
</style>
