<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { bezierEasing } from '$lib/animation'
	import { reduceMotion, landscapeColor as fullColor } from '$src/store'
	import {
		getDistance,
		randomChance,
		randomFloat,
		randomInt,
		sleep,
		type XY,
	} from '$lib/math'
	import Gem from './Gem.svelte'
	import { updateHillFun, funState } from '$lib/landscape/fun'
	import Sparkles from './Sparkles.svelte'
	import HillIvy from './HillIvy.svelte'

	export const featureType = 'hill'

	export let id: number
	export let x: number
	export let y: number
	export let xJitter: number
	export let yJitter: number
	export let mini = false
	export let size: number
	export let animate: boolean
	export let delay: number
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number
	export let popMode: boolean

	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 900

	let willAnimate = true
	let animateElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement
	let animatePoppingPathElement: SVGAnimateElement

	let inColor = false
	$: inColor = $fullColor
	let lastTimeout: NodeJS.Timer
	let nudgeX = 0
	let nudgeScaleY = 1
	export function flashColor(x: number, y: number, duration: number) {
		const distance = getDistance(x - centerX, y - centerMass)
		const force = 40 - distance
		if (force > 0) {
			const xMagnitude = (x - centerX) / distance
			const yMagnitude = (y - centerMass) / distance
			nudgeX = xMagnitude * force * 0.4
			nudgeScaleY = 1 + (yMagnitude * force) / 240
			animateSkewElement?.beginElement()
		}
		if ($fullColor || duration === 0) return
		const flashDelay = distance * 7
		setTimeout(async () => (inColor = true), flashDelay)
		const thisTimeout = setTimeout(async () => {
			if (lastTimeout === thisTimeout) inColor = $fullColor
		}, Math.max(duration, flashDelay))
		lastTimeout = thisTimeout
	}

	$: xy = [x, y] as XY
	$: centerX = (x + xJitter + (mini ? 1 : 1.5)) * 15
	$: centerY = (y + yJitter) * 10
	$: radius = (mini ? 8 : 13.5) + 2 * size
	$: diameter = radius * 2
	$: vertLength = mini ? 7 : 10
	$: centerMass = centerY - vertLength
	$: hover =
		!$reduceMotion &&
		!popMode &&
		mouseOver &&
		Math.abs(centerX - mouseX) < radius + STROKE_HALF &&
		Math.abs(centerMass - mouseY) < radius + STROKE_HALF

	// Vertical radius should be 2/3, not 1/3, but it just looks better this way
	$: hillBottomSegment = `a${radius} ${radius / 3} 0 0 1 -${diameter} 0`
	$: hillTopPath = `M-${radius} -5 v${-(mini
		? 2
		: 5)} a${radius} ${radius} 0 0 1 ${diameter} 0 v5 ${hillBottomSegment}`
	$: hillBottomPath = `M${radius} -6 v6 ${hillBottomSegment} v-6`
	$: hillAnimationClip = `M${-radius - STROKE_HALF} 0 l${-radius},${
		-vertLength - radius - STROKE_HALF
	} h${diameter * 2 + STROKE_WIDTH} l${-radius},${vertLength + radius + STROKE_HALF} a${
		radius + STROKE_HALF
	} ${radius / 3 + STROKE_HALF} 0 0 1 ${-diameter - STROKE_WIDTH} 0`
	$: popUpTranslate = mini ? 25 : 33

	function createPopRingPath(radius: number) {
		const startAtRadians = randomFloat(0, Math.PI * 2)
		let ringPercent = 0
		let ringSegment = 0
		let peakStart = [0, 0]
		let peak = false
		let bigPeak = randomChance()
		let path = ''
		while (ringPercent <= 1) {
			const radians = startAtRadians + Math.PI * 2 * ringPercent
			const x = radius * Math.cos(radians) * (peak ? 1.1 : 1)
			const baseY = (radius * Math.sin(radians)) / 3
			if (path === '') {
				path += `M${x},${baseY}`
				peakStart = [x, baseY]
			} else {
				const y = peak ? baseY - (bigPeak ? randomInt(5, 7) : randomInt(2, 4)) : baseY
				const cRadians = peak
					? radians - 0.1
					: startAtRadians + (ringPercent - ringSegment) * Math.PI * 2 + 0.1
				const cx = radius * Math.cos(cRadians)
				const cBaseY = (radius * Math.sin(cRadians)) / 3
				path += `Q${cx},${cBaseY} ${x},${y}`
				if (!peak) {
					path += `A${radius},${radius / 3} 0 0 0 ${peakStart[0]},${
						peakStart[1]
					} M${x},${y}`
					peakStart = [x, y]
				}
			}
			if (ringPercent === 1) break
			ringSegment = Math.min(1 - ringPercent, randomFloat(0.04, 0.12))
			ringPercent += ringSegment
			if (peak) bigPeak = !bigPeak
			peak = !peak
			if (ringPercent > 0.96) {
				if (peak) {
					ringPercent = 0.98
					bigPeak = false
				} else {
					ringPercent = 1
				}
			}
		}
		return path
	}
	$: popRingTopPath = popped ? createPopRingPath(radius) : ''

	let popped = false
	let popFragments: [delay: number, magnitude: number, size: number, snow: boolean][] = []
	let juice = 0 // TODO: Changed to gem factor
	const { features } = funState
	$: snowy = $features.hill[id]?.snowy
	$: snowcapPath = snowy ? generateSnowcapPath(radius, vertLength) : ''

	function generateSnowcapPath(radius: number, vertLength: number) {
		const waves = 4
		const curves = 1 + (waves - 1) * 2
		const paddedRadius = radius + STROKE_HALF
		const edgeAngle = randomFloat(0.4, 0.6)
		const edgeX = Math.cos(edgeAngle) * -paddedRadius
		const edgeY = -vertLength - Math.sin(edgeAngle) * paddedRadius
		const circleY = edgeY - (Math.sin(edgeAngle) * paddedRadius) / 2
		const angleRange = Math.PI - edgeAngle * 2
		const angleStep = angleRange / curves
		let slope = 1
		let path = `M${edgeX},${edgeY}`
		for (let i = 0; i < curves; i++) {
			const sweep = (i + 1) / curves
			const variation = 1 - Math.abs(sweep - 0.5) / 0.5
			const angle =
				Math.PI -
				edgeAngle -
				angleRange * sweep +
				((randomFloat(-1, 1) * angleStep) / 6) * variation
			const toX = Math.cos(angle) * paddedRadius
			const toY = circleY + (Math.sin(angle) * paddedRadius) / 2
			const c1X = Math.cos(angle + (angleStep * 2) / 3) * paddedRadius
			const c1Y =
				circleY +
				(Math.sin(angle + (angleStep * 2) / 3) * paddedRadius) / 2 +
				randomFloat(0.6, 1.3 + variation / 2) * slope
			const c2X = Math.cos(angle + angleStep / 3) * paddedRadius
			const c2Y =
				circleY +
				(Math.sin(angle + angleStep / 3) * paddedRadius) / 2 +
				randomFloat(0.6, 1.3 + variation / 2) * slope
			path += ` C${c1X},${c1Y} ${c2X},${c2Y} ${toX},${toY}`
			slope *= -1
		}
		path += ` A${paddedRadius},${paddedRadius} 0 0 0 ${edgeX},${edgeY} Z`
		return path
	}

	export function doFun(x: number, y: number): void | number {
		if (popped) return
		const xDistance = x - centerX
		const yDistance = y - centerY
		if (
			Math.abs(xDistance) < radius * 1.2 &&
			yDistance < radius / 3 &&
			yDistance > -radius - 0.3 - vertLength
		) {
			popped = true
			updateHillFun(id, xy, { state: 'popped' })
			const particleCount = snowy ? 16 : 10
			for (let i = 0; i < particleCount; i++) {
				const central = 1 - Math.abs((i + 0.5) / particleCount - 0.5) * 0.5
				popFragments.push([
					randomInt(0, 200),
					randomInt(8, 45),
					(randomInt(4, 12) / 2) * central,
					snowy && randomChance(0.3),
				])
			}
			tick().then(async () => {
				animatePoppingPathElement?.beginElement()
				await sleep(750) // Wait until all fragments fade out
				popFragments.length = 0 // Clean up fragments
			})
			return 0
		}
	}

	let filled = false
	let fillDistance = 0

	export function fillIn(x: number, y: number): number {
		if (filled) return 0
		filled = true
		const xDelta = x - centerX
		const yDelta = y - centerY
		fillDistance = getDistance(xDelta, yDelta)
		return fillDistance
	}

	onMount(() => {
		willAnimate = animate
		if (animate) setTimeout(() => animateElement?.beginElement(), delay)
	})
</script>

<!-- Position relative to fix stacking context bug in FF -->
<g style:position="relative" transform="translate({centerX} {centerY})">
	<g opacity={willAnimate && !popped ? 0 : 1}>
		<animateTransform
			id="hill_nudge_animate_{id}"
			bind:this={animateSkewElement}
			attributeName="transform"
			type="skewX"
			begin="indefinite"
			values="0;{nudgeX};0"
			keyTimes="0;0.3;1"
			calcMode="spline"
			dur="600ms"
			keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
		/>
		<path
			fill="none"
			stroke="var(--tertiary-color)"
			stroke-width={STROKE_WIDTH * 2.5}
			d={hillBottomPath}
		/>
		<g>
			<g
				style:transform="translateY({hover ? (mini ? 2.5 : 4) : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out"
			>
				<path
					fill="none"
					stroke="var(--tertiary-color)"
					stroke-width={STROKE_WIDTH * 2.5}
					d={hillTopPath}
				/>
				<path
					fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
					stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
					stroke-width={STROKE_WIDTH}
					stroke-linecap="round"
					d={hillTopPath}
					style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease, stroke
					{inColor ? 200 : 1000}ms {y * 20}ms ease"
				/>
				{#if snowy}
					<path
						fill="var(--{inColor ? 'snow-color' : 'landscape-color'})"
						style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease"
						style:animation-duration="{300 + 400 * size}ms"
						style:animation-delay="{100 + 300 * size}ms"
						class="snowcap"
						d={snowcapPath}
					/>
				{/if}
			</g>
			{#if !popped}
				<animateTransform
					attributeName="transform"
					type="scale"
					begin="hill_nudge_animate_{id}.begin"
					values="1 1;1 {nudgeScaleY};1 1"
					keyTimes="0;0.3;1"
					calcMode="spline"
					dur="600ms"
					keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
				/>
			{:else}
				<animateTransform
					attributeName="transform"
					type="scale"
					values="1 1;1 0.5"
					dur="200ms"
					keySplines={bezierEasing.circInOut}
					calcMode="spline"
					fill="freeze"
					bind:this={animatePoppingPathElement}
					id="hill_popping_animate_{id}"
					begin="indefinite"
				/>
			{/if}
		</g>
		<path
			fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
			stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease, stroke {inColor
				? 200
				: 1000}ms {y * 20}ms ease"
			d={hillBottomPath}
		/>
		{#if !popped}
			<animate
				id="hill_draw_animate_{id}"
				bind:this={animateElement}
				attributeName="opacity"
				values="0;0;1;1"
				keyTimes="0;0.5;0.6;1"
				begin="indefinite"
				dur="{DURATION}ms"
				fill="freeze"
			/>
		{:else}
			<animate
				attributeName="opacity"
				values="1;0"
				dur="200ms"
				keySplines={bezierEasing.cubicOut}
				calcMode="spline"
				fill="freeze"
				begin="hill_popping_animate_{id}.begin+150ms"
			/>
		{/if}
	</g>
	<clipPath id="hill_clip_{id}"> <path d={hillAnimationClip} /> </clipPath>
	<g clip-path="url(#hill_clip_{id})">
		<g
			style:transform="translateY({hover ? (mini ? 2.5 : 4) : 0}px)"
			style:transition="transform {hover ? 75 : 200}ms ease-out"
		>
			<path
				d="M-{radius} 10 v-{mini ? 17 : 20} a{radius} {radius} 0 0 1 {diameter} 0 v{mini
					? 17
					: 20}"
				fill="var(--before-color)"
				stroke="var(--before-color)"
				stroke-width={STROKE_WIDTH}
				transform="translate(0 {popUpTranslate})"
			>
				<animateTransform
					attributeName="transform"
					type="translate"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0 {popUpTranslate};0 0;0 {popUpTranslate}"
					keyTimes="0;0.6;1"
					keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
					calcMode="spline"
					fill="freeze"
				/>
			</path>
		</g>
	</g>
	{#if popped}
		<g
			class="popped"
			opacity={filled ? 0 : 1}
			style:transition="opacity {1500 + fillDistance * 20}ms 1.5s cubic-bezier(0.32, 0,
			0.67, 0)"
		>
			<clipPath id="hill_base_clip_{id}">
				<ellipse rx={radius} ry={radius / 3} />
			</clipPath>
			<ellipse
				class="popped-base"
				rx={radius}
				ry={radius / 3}
				fill="var(--{inColor ? 'before-color' : 'landscape-color'})"
			/>
			{#if filled}
				<g clip-path="url(#hill_base_clip_{id})">
					<ellipse
						class="fill-up"
						rx={radius}
						ry={radius / 3}
						fill="var(--accent-color)"
						style:transform="translateY({radius / 1.4}px)"
						style:animation-delay="{300 + fillDistance * 15}ms"
					/>
				</g>
			{/if}
			<path
				fill="var(--{inColor ? 'before-color' : 'landscape-color'})"
				stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M{-radius},0 {popRingTopPath}z"
				style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease, stroke {inColor
					? 200
					: 1000}ms {y * 20}ms ease"
				class="popped-ring"
			/>
			<!-- <g transform="translate(0 -16)"><Gem /></g> -->
			{#each popFragments as [delay, magnitude, fSize, snow], f}
				<g transform="rotate({-30 + 60 * (f / (popFragments.length - 1))})">
					<ellipse
						cx={-radius * 0.8 + radius * 1.6 * (f / (popFragments.length - 1))}
						cy={-radius / 1}
						rx={fSize}
						ry={fSize * 2.5}
						fill="var(--{inColor
							? snow
								? 'snow-color'
								: 'before-color'
							: 'landscape-color'})"
						class="fragment"
						style:animation-delay="{150 + delay + 250}ms"
					>
						<animate
							attributeName="ry"
							values="{fSize * 2.5};{fSize};{fSize * 0.5}"
							dur="400ms"
							keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicOut}"
							calcMode="spline"
							fill="freeze"
							begin="hill_popping_animate_{id}.begin+{150 + delay}ms"
						/>
						<animate
							attributeName="rx"
							values="{fSize};{fSize};{fSize * 0.5}"
							dur="400ms"
							keySplines="0 0 0 0;{bezierEasing.cubicOut}"
							calcMode="spline"
							fill="freeze"
							begin="hill_popping_animate_{id}.begin+{150 + delay}ms"
						/>
						<animateTransform
							attributeName="transform"
							type="translate"
							values="0 0;0 -{magnitude}"
							dur="400ms"
							keySplines={bezierEasing.circOut}
							calcMode="spline"
							fill="freeze"
							begin="hill_popping_animate_{id}.begin+{150 + delay}ms"
						/>
					</ellipse>
				</g>
			{/each}
		</g>
		{#if juice > 0}
			<Sparkles count={juice * 12} y={-vertLength} disperseX={20} disperseY={12} />
		{/if}
	{/if}
	<HillIvy {id} {y} {size} {hover} {nudgeX} {popped} />
</g>

<style>
	.popped {
		/* opacity: 0; */
		animation: fade 50ms 150ms cubic-bezier(0.33, 1, 0.68, 1) reverse backwards;
	}

	.popped-base {
		animation: fade-color 300ms 200ms ease-out forwards;
	}

	.popped-ring {
		animation: fade 500ms 1s ease-in forwards;
	}

	.fragment {
		animation: fade 150ms cubic-bezier(0.32, 0, 0.67, 0) forwards;
	}

	.snowcap {
		animation: fade 300ms cubic-bezier(0.33, 1, 0.68, 1) reverse backwards;
	}

	@keyframes fade {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes fade-color {
		100% {
			fill: #0005;
		}
	}

	.fill-up {
		animation: to-middle 1s cubic-bezier(0.32, 1, 0.67, 1) forwards;
	}

	@keyframes to-middle {
		100% {
			transform: translateY(0);
		}
	}
</style>
