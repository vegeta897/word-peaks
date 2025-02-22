<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'
	import { getDistance } from '$lib/math'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 900

	export let id: number
	export let x: number
	export let y: number
	export let xJitter: number
	export let yJitter: number
	export let mini = false
	export let size: number
	export let animate: boolean
	export let delay = 0
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number
	export let forceColor: boolean

	let willAnimate = true
	let animateElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement

	let inColor = false
	$: inColor = forceColor
	let lastTimeout: number
	let nudgeX = 0
	let nudgeScaleY = 1
	export function flashColor(x: number, y: number, duration: number) {
		const distance = getDistance(x - centerX, y - centerMass)
		const force = 4 - distance
		if (force > 0) {
			const xMagnitude = (x - centerX) / distance
			const yMagnitude = (y - centerMass) / distance
			nudgeX = xMagnitude * force * 4
			nudgeScaleY = 1 + (yMagnitude * force) / 24
			animateSkewElement?.beginElement()
		}
		if (forceColor) return
		const flashDelay = distance * 70
		setTimeout(async () => (inColor = true), flashDelay)
		const thisTimeout = setTimeout(
			async () => {
				if (lastTimeout === thisTimeout) inColor = forceColor
			},
			Math.max(duration, flashDelay)
		)
		lastTimeout = thisTimeout
	}

	$: centerX = (x + xJitter + (mini ? 1 : 1.5)) * 1.5
	$: centerY = y + yJitter + 1
	$: radius = (mini ? 0.8 : 1.35) + 0.2 * size
	$: centerMass = centerY - (mini ? 0.7 : 1)
	$: hover =
		mouseOver &&
		Math.abs(centerX - mouseX) < radius + STROKE_HALF &&
		Math.abs(centerMass - mouseY) < radius + STROKE_HALF

	$: hillTopPath = `M-${radius} -0.5 v${-(mini ? 0.2 : 0.5)} a${radius} ${radius} 0 0 1 ${
		radius * 2
	} 0 v0.5 a${radius} ${radius / 3} 0 0 1 -${radius * 2} 0`
	$: hillBottomPath = `M${radius} -0.6 v0.6 a${radius} ${radius / 3} 0 0 1 -${
		radius * 2
	} 0 v-0.6`
	$: hillAnimationClip = `M${-radius - STROKE_HALF} 0 v${
		-(mini ? 0.7 : 1) - radius - STROKE_HALF
	} h${radius * 2 + STROKE_WIDTH} v${(mini ? 0.7 : 1) + radius + STROKE_HALF} a${
		radius + STROKE_HALF
	} ${radius / 3 + STROKE_HALF} 0 0 1 ${-radius * 2 - STROKE_WIDTH} 0`
	$: popTranslate = mini ? 2.5 : 3.3

	onMount(() => {
		willAnimate = animate
		if (animate) setTimeout(() => animateElement?.beginElement(), delay)
	})
</script>

<!-- Position relative to fix stacking context bug in FF -->
<g style:position="relative" transform="translate({centerX} {centerY})">
	<g opacity={willAnimate ? 0 : 1}>
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
			<path
				fill="none"
				stroke="var(--tertiary-color)"
				stroke-width={STROKE_WIDTH * 2.5}
				d={hillTopPath}
				style:transform="translateY({hover ? (mini ? 0.25 : 0.4) : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out"
			/>
			<path
				fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
				stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				d={hillTopPath}
				style:transform="translateY({hover ? (mini ? 0.25 : 0.4) : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out, fill {inColor
					? 200
					: 1000}ms ease, stroke
				{inColor ? 200 : 1000}ms ease"
			/>
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
		</g>
		<path
			fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
			stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			style:transition="fill {inColor ? 200 : 1000}ms ease, stroke {inColor
				? 200
				: 1000}ms ease"
			d={hillBottomPath}
		/>
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
	</g>
	<clipPath id="hill_clip_{id}"> <path d={hillAnimationClip} /> </clipPath>
	<g clip-path="url(#hill_clip_{id})">
		<g
			style:transform="translateY({hover ? (mini ? 0.25 : 0.4) : 0}px)"
			style:transition="transform {hover ? 75 : 200}ms ease-out"
		>
			<path
				d="M-{radius} 1 v-{mini ? 1.7 : 2} a{radius} {radius} 0 0 1 {radius * 2} 0 v{mini
					? 1.7
					: 2}"
				fill="var(--before-color)"
				stroke="var(--before-color)"
				stroke-width={STROKE_WIDTH}
				transform="translate(0 {popTranslate})"
			>
				<animateTransform
					attributeName="transform"
					type="translate"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0 {popTranslate};0 0;0 {popTranslate}"
					keyTimes="0;0.6;1"
					keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
					calcMode="spline"
					fill="freeze"
				/>
			</path>
		</g>
	</g>
</g>
