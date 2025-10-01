<script lang="ts">
	import { bezierEasing } from '$lib/animation'
	import { getDistance, xyToGrid, type XY } from '$lib/math'
	import { type ComponentProps, tick } from 'svelte'
	import { createPondPath } from '$lib/landscape/pond'
	import { landscapeForceColor } from '$src/store'
	import { stringifyPathData } from '$lib/paths'
	import { fade } from 'svelte/transition'
	import PondFun, { type PondFunResult } from './PondFun.svelte'
	import { get } from 'svelte/store'

	export const funStatus: { status: 'waiting' | 'started' | 'done' } = {
		status: 'waiting',
	}

	export let tiles: XY[] = []
	export let newTiles: XY[] = []
	export let animate: boolean
	export let delay: number
	export let landscapeWidth: number
	export let landscapeHeight: number
	export let mini = false
	export let spawnIceShards: ComponentProps<PondFun>['spawnIceShards']

	$: maxDistance = getDistance(landscapeWidth, landscapeHeight)
	$: expandDuration = maxDistance * 70

	type Flood = [id: number, ...XY, duration: number, SVGAnimateElement, keyTimes: string]
	let floods: Flood[] = []
	let floodID = 0
	export async function flashColor(x: number, y: number, duration: number) {
		if (get(landscapeForceColor)) return
		const fullDuration = duration + 800
		const expandKeyTime = expandDuration / fullDuration
		const fadeKeyTime = Math.max(expandKeyTime, 1 - 800 / fullDuration)
		const flood = [
			++floodID,
			x,
			y,
			fullDuration,
			null /* SVGAnimateElement will bind here */,
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

	let pondFunComponenet: PondFun
	let havingFun = false

	export function doFun(x: number, y: number, dragMode: boolean): PondFunResult {
		if (funStatus.status === 'done') return { done: true }
		const funResult = pondFunComponenet.doFun(x, y, dragMode)
		if (!havingFun && funResult?.frozePond) havingFun = true
		if (funResult?.done) funStatus.status = 'done'
		return funResult
	}

	export const fillIn = (x: number, y: number) => pondFunComponenet.fillIn(x, y)

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
		{#if !$landscapeForceColor}
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
			fill={$landscapeForceColor ? 'var(--after-color)' : '#fff0'}
			style:transition="fill {$landscapeForceColor ? 200 : 1000}ms ease"
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
{/if}
<PondFun
	{pondPath}
	{maxDistance}
	{tilesMap}
	{landscapeWidth}
	{landscapeHeight}
	{spawnIceShards}
	bind:this={pondFunComponenet}
/>
