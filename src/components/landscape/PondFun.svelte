<script lang="ts" context="module">
	export type PondFunResult = null | {
		done?: boolean
		brokenTiles?: number
		frozePond?: boolean
	}
</script>

<script lang="ts">
	import { bezierEasing } from '$lib/animation'
	import { updatePondFun } from '$lib/landscape/fun'
	import {
		type SubTile,
		type IceShard,
		type IceShardSection,
		calculateBounces,
	} from '$lib/landscape/ice'
	import { createSubTilePath, createPondPath } from '$lib/landscape/pond'
	import {
		getDistance,
		getDistanceBetween,
		getNeighbors8,
		midXY,
		randomFloat,
		randomInt,
		sleep,
		type XY,
		xyToGrid,
	} from '$lib/math'
	import { type PathDataCommand, stringifyPathData } from '$lib/paths'
	import { answer, highContrast, landscapeColor as fullColor } from '$src/store'
	import Rand from 'rand-seed'
	import { tick } from 'svelte'
	import { cubicIn } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import Sparkles from './Sparkles.svelte'

	export let tiles: XY[]
	export let pondPath: string
	export let landscapeWidth: number
	export let landscapeHeight: number
	export let maxDistance: number
	export let spawnIceShards: (y: number, shardSection: IceShardSection) => void

	$: tilesMap = new Map(tiles.map((xy) => [xyToGrid(xy), xy]))
	let nonFrozenTilesMap: typeof tilesMap
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
		subTilesStatic: Map<string, SubTile>
		subTileVertices: Map<string, XY>
		brokenPath: string
	}
	let frozenPonds: FrozenPond[] = []
	const emptyTilesMap: Map<string, XY> = new Map()
	let iceShardSectionId = 0
	let sparkles: { xy: XY; count: number }[] = [] // TODO: Change to sea-floor gems

	export function doFun(x: number, y: number, dragMode: boolean): PondFunResult {
		const normalizedXY: XY = [x / 10 / 1.5, y / 10]
		let clickedTile: null | { grid: string; xy: XY; distance: number } = null
		for (
			let nearX = Math.floor(normalizedXY[0] - 0.4);
			nearX <= Math.floor(normalizedXY[0] + 0.4);
			nearX++
		) {
			for (
				let nearY = Math.floor(normalizedXY[1] - 0.6);
				nearY <= Math.floor(normalizedXY[1] + 0.6);
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
		if (!clickedTile) return null
		let firstFreeze = false
		if (!nonFrozenTilesMap) {
			nonFrozenTilesMap = new Map(tilesMap)
			firstFreeze = true
		}
		const clickedFrozenPond = frozenPonds.find((f) => f.tiles.has(clickedTile.grid))
		if (clickedFrozenPond) {
			if (Date.now() < lastFreeze + clickedFrozenPond.freezeDelay) return null // Debounce
			const tileCountBeforeBreak = clickedFrozenPond.tiles.size
			const minCrawlDistance = dragMode ? 0 : 1.5
			const maxCrawlDistance = dragMode ? 1 : 1.5
			const breakableSubTiles: Map<string, SubTile> = new Map()
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			// Select tiles to break
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				breakIce(clickedFrozenPond, grid, xy, breakableSubTiles)
				getNeighbors8(...xy).forEach((nXY, n) => {
					const neighborGrid = xyToGrid(nXY)
					if (openTiles.has(neighborGrid) || !clickedFrozenPond.tiles.has(neighborGrid))
						return
					// const neighborAlone = !getNeighbors8(...nXY).some((nnXY) =>
					// 	clickedFrozenPond.tiles.has(xyToGrid(nnXY))
					// )
					// if (neighborAlone) {
					// 	breakIce(clickedFrozenPond, neighborGrid, nXY, breakableSubTiles)
					// } else {
					const distance = getDistanceBetween(clickedTile.xy, nXY)
					if (distance > randomFloat(minCrawlDistance, maxCrawlDistance)) return
					openTiles.set(neighborGrid, nXY)
					// }
				})
			}
			const shards: IceShard[] = []
			breakableSubTiles.forEach((subTile, subTileGrid) => {
				const willBreak = [...subTile.tileGrids].every(
					(tg) => !clickedFrozenPond.tiles.has(tg)
				)
				if (!willBreak) return
				clickedFrozenPond.subTiles.delete(subTileGrid)
				const [x, y] = subTile.subTileXY
				const { subTileVertices, subTilesStatic } = clickedFrozenPond
				const points: XY[] = [
					subTileVertices.get(xyToGrid(subTile.subTileXY))!,
					subTileVertices.get(xyToGrid([x + 1, y]))!,
					subTileVertices.get(xyToGrid([x + 1, y + 1]))!,
					subTileVertices.get(xyToGrid([x, y + 1]))!,
				]
				// Push in corners on edges of pond
				if (!subTilesStatic.has(xyToGrid([x, y - 1]))) {
					points[0] = midXY(points[0], points[3])
					points[1] = midXY(points[1], points[2])
				} else if (!subTilesStatic.has(xyToGrid([x, y + 1]))) {
					points[3] = midXY(points[3], points[0])
					points[2] = midXY(points[2], points[1])
				}
				if (!subTilesStatic.has(xyToGrid([x - 1, y]))) {
					points[0] = midXY(points[0], points[1])
					points[3] = midXY(points[3], points[2])
				} else if (!subTilesStatic.has(xyToGrid([x + 1, y]))) {
					points[1] = midXY(points[1], points[0])
					points[2] = midXY(points[2], points[3])
				}
				const shardShelfPathData: PathDataCommand[] = []
				for (let p = 1; p <= 4; p++) {
					const prev = points[p - 1]
					const curr = points[p % 4]
					if (curr[0] < prev[0]) {
						shardShelfPathData.push(
							['M', prev],
							['L', [prev[0], prev[1] + 0.35]],
							['L', [curr[0], curr[1] + 0.35]],
							['L', curr],
							['Z']
						)
					}
				}
				const xDistance = x / 2 - normalizedXY[0]
				const yDistance = y / 2 - normalizedXY[1]
				const distance = getDistance(xDistance, yDistance)
				const xMagnitude = xDistance / distance
				const yMagnitude = yDistance / distance
				const force = 1 / Math.min(4, distance + 1)
				const zVelocity = 3 + cubicIn(randomFloat(0, 1)) * 40 * force
				const iceShard: IceShard = {
					subTile,
					origin: [(points[0][0] + points[2][0]) / 2, (points[0][1] + points[2][1]) / 2],
					rotation: randomInt(-160, 160),
					velocity: [
						randomInt(-5, 5) + xMagnitude * force * 35,
						randomInt(-5, 5) + yMagnitude * force * 25,
					],
					...calculateBounces(zVelocity),
					mainPath: stringifyPathData([
						...points.map((p, i) => [i === 0 ? 'M' : 'L', p] as [string, XY]),
						['Z'],
					]),
					shelfPath: stringifyPathData(shardShelfPathData),
				}
				shards.push(iceShard)
			})
			const shardSectionsByRow: Map<number, IceShardSection> = new Map()
			shards.forEach((shard) => {
				let shardSection = shardSectionsByRow.get(shard.subTile.pondRow)
				if (!shardSection) {
					shardSection = {
						id: iceShardSectionId++,
						delay: 0,
						shards: [],
					}
					shardSectionsByRow.set(shard.subTile.pondRow, shardSection)
				}
				shardSection.shards.push(shard)
			})
			shardSectionsByRow.forEach((section, y) => {
				spawnIceShards(y, section)
			})
			const { mainPath, shelfPath } = createSubTilePath(
				[...clickedFrozenPond.subTiles.values()].map((st) => st.subTileXY),
				clickedFrozenPond.subTileVertices
			)
			clickedFrozenPond.brokenPath = stringifyPathData(mainPath)
			clickedFrozenPond.shelfPath = stringifyPathData(shelfPath)
			clickedFrozenPond.emptyTiles.forEach((v, k) => emptyTilesMap.set(k, v))
			frozenPonds = frozenPonds // Reactivity
			return {
				done: emptyTilesMap.size === tilesMap.size,
				brokenTiles: tileCountBeforeBreak - clickedFrozenPond.tiles.size,
			}
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
				subTilesStatic: new Map(),
				subTiles: new Map(),
				subTileVertices: new Map(),
				brokenPath: '',
			}
			const tileList: XY[] = []
			const rng = new Rand($answer + clickedTile.grid)
			const getRng = () => rng.next()
			const openTiles: Map<string, XY> = new Map([[clickedTile.grid, clickedTile.xy]])
			while (openTiles.size > 0) {
				const [grid, xy] = [...openTiles][0]
				openTiles.delete(grid)
				nonFrozenTilesMap.delete(grid)
				const subTiles: Map<string, SubTile> = new Map()
				freezingPond.tiles.set(grid, { subTiles, xy })
				updatePondFun(grid, xy, { state: 'frozen' })
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
									pondRow: xy[1],
									tileGrids: new Set([grid]),
								}
								freezingPond.subTiles.set(subTileGrid, subTile)
								freezingPond.subTilesStatic.set(subTileGrid, subTile)
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
			frozenPonds = [...frozenPonds, freezingPond]
			// Draw all ponds as non-frozen first so we can transition them away
			if (firstFreeze) nonFrozenPath = pondPath
			freezingPond.freezeDelay = (freezingPond.radius + 1) * 60
			tick().then(() => {
				freezingPond.gradientElement?.beginElement()
				nonFrozenPath = stringifyPathData(createPondPath([...nonFrozenTilesMap.values()]))
			})
			return { frozePond: true }
		}
	}

	function breakIce(
		pond: FrozenPond,
		tileGrid: string,
		tileXY: XY,
		breakableSubTiles: Map<string, SubTile>
	) {
		pond.tiles.get(tileGrid)!.subTiles.forEach((st, g) => breakableSubTiles.set(g, st))
		pond.emptyTiles.set(tileGrid, tileXY)
		pond.tiles.delete(tileGrid)
		// const juice = $funStatus.pondTiles.get(tileGrid)?.juice || 0
		// if (juice > 0) sparkles = [...sparkles, { xy: tileXY, count: juice * 3 }]
		updatePondFun(tileGrid, tileXY, { state: 'broken' })
	}

	let filled = false
	let fillFromXY: XY
	let fillingGradientElement: SVGAnimateElement

	export function fillIn(x: number, y: number): number {
		if (filled) return 0
		filled = true
		fillFromXY = [x, y]
		sleep(500).then(() => fillingGradientElement?.beginElement())
		return 500 + maxDistance * 100
	}
</script>

{#if nonFrozenTilesMap}
	<g
		opacity={filled ? 0 : 1}
		style:transition="opacity {1000 + maxDistance * 100}ms 1.5s cubic-bezier(0.32, 0,
		0.67, 0)"
	>
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
				{#if !$fullColor}
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
					fill={$fullColor ? 'var(--after-color)' : '#fff0'}
					d={nonFrozenPath}
					style:transition="fill {$fullColor ? 200 : 1000}ms ease"
				/>
			</g>
		{/key}
		{#each frozenPonds as { radius, origin, freezeDelay, gradientElement, path, shelfPath, subTiles, subTileVertices, brokenPath, tiles }, f (f)}
			<radialGradient
				id="pond_freeze_gradient_{f}"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate({origin[0]} {origin[1]}) scale(15 10)"
				cx="0"
				cy="0"
				r={radius}
			>
				<stop
					stop-color="var(--{$fullColor ? 'ice-color' : 'landscape-color'})"
					style:transition="stop-color {$fullColor ? 200 : 1000}ms ease"
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
				<stop stop-color={$fullColor ? '#B2CFFF00' : '#fff0'}>
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
					stroke="var(--{$fullColor ? 'ice-shelf-color' : 'landscape-color'})"
					fill="var(--{$fullColor ? 'ice-shelf-color' : 'landscape-color'})"
					d={shelfPath}
					style:transition="fill {$fullColor ? 200 : 1000}ms ease, stroke {$fullColor
						? 200
						: 1000}ms ease"
				/>
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
		{/each}
		{#each sparkles as { xy: [x, y], count }}
			<Sparkles
				x={(x + 0.5) * 15}
				y={(y + 0.5) * 10}
				{count}
				disperseX={10}
				disperseY={7}
			/>
		{/each}
		{#if filled}
			<radialGradient
				id="pond_fill_gradient"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate({fillFromXY[0]} {fillFromXY[1]}) scale(15 10)"
				cx="0"
				cy="0"
				r={maxDistance}
			>
				<stop
					stop-color="var(--accent-color)"
					style:transition="stop-color {$fullColor ? 200 : 1000}ms ease"
				>
					<animate
						bind:this={fillingGradientElement}
						id="pond_fill_animate"
						attributeName="offset"
						values="0;0;1"
						calcMode="spline"
						keySplines="{bezierEasing.sineIn};{bezierEasing.sineOut}"
						keyTimes="0;0.1;1"
						dur="{maxDistance * 100}ms"
						fill="freeze"
						begin="indefinite"
					/>
				</stop>
				<stop stop-color="#de49a200">
					<animate
						attributeName="offset"
						values="0;1.01"
						calcMode="spline"
						keySplines={bezierEasing.sineOut}
						dur="{maxDistance * 100}ms"
						fill="freeze"
						begin="pond_fill_animate.begin"
					/>
				</stop>
			</radialGradient>
			<rect
				clip-path="url(#pond_path)"
				width={landscapeWidth * 15}
				height={landscapeHeight * 10}
				fill="url('#pond_fill_gradient')"
			/>
		{/if}
	</g>
{/if}
