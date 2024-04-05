<script lang="ts">
	import { bezierEasing } from '$lib/transitions'
	import { getDistance, type XY } from '$lib/math'
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
	export let fillDuration: number

	$: maxDistance = getDistance(landscapeWidth, landscapeHeight)
	$: expandDuration = maxDistance * 70

	type Ripple = [id: number, ...XY, duration: number, SVGAnimateElement, keyTimes: string]
	let ripples: Ripple[] = []
	let rippleID = 0
	export async function flashColor(x: number, y: number, duration: number) {
		if (forceColor) return
		const fullDuration = duration + 800
		const expandKeyTime = expandDuration / fullDuration
		const fadeKeyTime = Math.max(expandKeyTime, 1 - 800 / fullDuration)
		const ripple = [
			++rippleID,
			x,
			y,
			fullDuration,
			null /* Animate element will bind here */,
			`0;${expandKeyTime};${fadeKeyTime};1`,
		] as unknown as Ripple
		ripples = [...ripples, ripple]
		await tick()
		ripple[4]?.beginElement()
		setTimeout(() => {
			ripples = ripples.filter((r) => r !== ripple)
		}, fullDuration)
	}

	let pondPath: string
	let previousPondPath: string
	let dripTiles: XY[] = []
	let dripDuration: number
	let pondAnimateElement: SVGAnimateElement

	async function onTiles() {
		previousPondPath = pondPath
		pondPath = createPondPath(tiles)
		if (animate && previousPondPath !== pondPath) {
			dripTiles = newTiles
				.map((_, i) => i)
				.filter((i) => i % (mini ? 2 : 3) === 0)
				.map((i) => newTiles[i])
			// Animations don't work right when new tiles arrive too quickly, but oh well
			dripDuration = 1600 + Math.min(fillDuration, dripTiles.length * 100)
			await tick()
			pondAnimateElement?.beginElement()
		}
	}

	$: if (tiles) onTiles()
</script>

<clipPath id="pond_path"> <path d={pondPath} /> </clipPath>
<g clip-path="url(#pond_path)">
	{#each dripTiles as [x, y], t (`${x}:${y}`)}
		<ellipse fill="var(--after-color)" cx={(x + 0.5) * 1.5} cy={y + 0.5}>
			<animate
				attributeName="rx"
				values="0;{mini ? 3 : 6}"
				calcMode="spline"
				fill="freeze"
				dur="1600ms"
				keySplines={bezierEasing.cubicOut}
				begin="pond_draw_animate.begin+{delay + t * 100 + 'ms'}"
			/>
			<animate
				attributeName="ry"
				values="0;{mini ? 2 : 4}"
				calcMode="spline"
				fill="freeze"
				dur="1600ms"
				keySplines={bezierEasing.cubicOut}
				begin="pond_draw_animate.begin+{delay + t * 100 + 'ms'}"
			/>
		</ellipse>
	{/each}
</g>
<clipPath id="prev_pond_path"> <path d={previousPondPath} /> </clipPath>
<g opacity="0">
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
			begin="pond_draw_animate.begin"
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
	<path
		stroke-width="0.2"
		stroke="var(--{forceColor ? 'after-color' : 'landscape-color'})"
		stroke-linecap="round"
		fill="none"
		style:transition="stroke {forceColor ? 200 : 1000}ms ease"
		d={pondPath}
	/>
	{#each ripples as ripple (ripple)}
		<radialGradient
			id="pond_ripple_gradient_{ripple[0]}"
			gradientUnits="userSpaceOnUse"
			gradientTransform="translate({ripple[1]} {ripple[2]}) scale(1.5 1)"
			cx="0"
			cy="0"
			r={maxDistance}
		>
			<stop stop-color="var(--after-color)">
				<animate
					bind:this={ripple[4]}
					id="pond_ripple_animate_{ripple[0]}"
					attributeName="offset"
					values="0;1;1;1"
					keyTimes={ripple[5]}
					dur="{ripple[3]}ms"
					fill="freeze"
					begin="indefinite"
				/>
			</stop>
			<stop stop-color="var(--after-color)" stop-opacity="0">
				<animate
					attributeName="offset"
					values="0;1.01;1.01;1.01"
					keyTimes={ripple[5]}
					dur="{ripple[3]}ms"
					fill="freeze"
					begin="pond_ripple_animate_{ripple[0]}.begin"
				/>
			</stop>
		</radialGradient>
		<path
			stroke-width="0.26"
			stroke-linecap="round"
			stroke="url('#pond_ripple_gradient_{ripple[0]}')"
			fill="url('#pond_ripple_gradient_{ripple[0]}')"
			d={pondPath}
		>
			<animate
				attributeName="opacity"
				values="1;1;1;0"
				keyTimes={ripple[5]}
				calcMode="spline"
				keySplines="0 0 0 0;0 0 0 0;0.25 0.1 0.25 1"
				dur="{ripple[3]}ms"
				fill="freeze"
				begin="pond_ripple_animate_{ripple[0]}.begin"
			/>
		</path>
	{/each}
	{#if animate}
		<animate
			bind:this={pondAnimateElement}
			id="pond_draw_animate"
			attributeName="opacity"
			values="0;0;1"
			dur="{dripDuration}ms"
			calcMode="spline"
			fill="freeze"
			keyTimes="0;{1 - 300 / dripDuration};1"
			keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicIn}"
			begin="indefinite"
		/>
	{/if}
</g>
