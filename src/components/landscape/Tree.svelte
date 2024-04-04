<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'
	import { getDistance } from '$lib/math'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const BASE_DURATION = 800

	export let id: number
	export let x: number
	export let y: number
	export let xJitter: number
	export let yJitter: number
	export let size: number
	export let animate: boolean
	export let delay = 0
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number
	export let forceColor: boolean

	let animateElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement

	let inColor = false
	$: inColor = forceColor
	let lastTimeout: NodeJS.Timer
	let nudgeX = 0
	let nudgeY = 1
	export function flashColor(x: number, y: number, duration: number) {
		if (forceColor) return
		const distance = getDistance(x - centerX, y - topCenter)
		const force = 4 - distance
		if (force > 0) {
			const xMagnitude = (x - centerX) / distance
			const yMagnitude = (y - topCenter) / distance
			nudgeX = xMagnitude * force * 4
			nudgeY = (yMagnitude * force) / 24
			animateSkewElement?.beginElement()
		}
		const flashDelay = distance * 70
		setTimeout(() => (inColor = true), flashDelay)
		const thisTimeout = setTimeout(() => {
			if (lastTimeout === thisTimeout) inColor = forceColor
		}, Math.max(duration, flashDelay))
		lastTimeout = thisTimeout
	}

	$: duration = BASE_DURATION * (0.8 + size * 0.4)

	$: width = 0.9 + size * 0.2
	$: trunkLength = width / 2
	$: radius = width / 2
	$: trunkToTop = trunkLength + radius

	// TODO: Add bounds to prevent drawing off-canvas
	$: centerX = (x + xJitter + 0.5) * 1.5
	$: centerY = y + yJitter + 0.5
	$: topCenter = centerY - trunkToTop + (hover ? 0.3 : 0)
	$: hover =
		mouseOver &&
		Math.abs(centerX - mouseX) < radius * 1.5 &&
		Math.abs(centerY - trunkLength - radius - mouseY) < radius * 1.5

	onMount(() => {
		if (animate) setTimeout(() => animateElement?.beginElement(), delay)
	})
</script>

<!-- <rect
		x={x * 1.5}
		{y}
		width="1.5"
		height="1"
		fill="#15a85040"
		stroke="#15a850"
		stroke-width="0.1"
	/> -->
<!-- Position relative to fix stacking context bug in FF -->
<g style:position="relative" transform="translate({centerX} {centerY})">
	<g opacity={animate ? 0 : 1}>
		<animateTransform
			id="tree_nudge_animate_{id}"
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
		<line
			stroke="var(--tertiary-color)"
			stroke-width={STROKE_WIDTH * 2.5}
			stroke-linecap="round"
			y2={-trunkLength}
		/>
		<circle
			cy={-trunkLength - radius}
			r={radius + STROKE_HALF * 1.5}
			fill="var(--tertiary-color)"
			style:transform="translateY({hover ? 0.3 : 0}px)"
			style:transition="transform {hover ? 50 : 200}ms ease-out"
		>
			<animate
				attributeName="cy"
				begin="tree_nudge_animate_{id}.begin"
				values="{-trunkToTop};{-trunkToTop - nudgeY};{-trunkToTop}"
				keyTimes="0;0.3;1"
				calcMode="spline"
				dur="600ms"
				keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
			/>
		</circle>
		<line
			stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			y2={-trunkLength - radius / 2}
			style:transition="fill {inColor ? 200 : 1000}ms ease, stroke {inColor
				? 200
				: 1000}ms ease"
		/>
		<g
			style:transform="translateY({hover ? 0.3 : 0}px)"
			style:transition="transform {hover ? 50 : 200}ms ease-out"
		>
			<!-- Using a wrapper group to avoid transform/color easing bug in FF -->
			<circle
				cy={-trunkToTop}
				r={radius - STROKE_HALF}
				fill="var(--{inColor ? 'correct-color' : 'tertiary-color'})"
				stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				style:transition="fill {inColor ? 200 : 1000}ms ease, stroke {inColor
					? 200
					: 1000}ms ease"
			>
				<animate
					attributeName="cy"
					begin="tree_nudge_animate_{id}.begin"
					values="{-trunkToTop};{-trunkToTop - nudgeY};{-trunkToTop}"
					keyTimes="0;0.3;1"
					calcMode="spline"
					dur="600ms"
					keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
				/>
			</circle>
		</g>
		<animate
			id="animate_tree_{id}"
			bind:this={animateElement}
			attributeName="opacity"
			values="0;0;1;1"
			keyTimes="0;0.4;0.6;1"
			begin="indefinite"
			dur="{duration}ms"
			fill="freeze"
		/>
	</g>
	<circle
		cy={-trunkLength - radius}
		r="0"
		fill="var(--correct-color)"
		style:transform="translateY({hover ? 0.3 : 0}px)"
		style:transition="transform {hover ? 50 : 200}ms ease-out"
	>
		<animate
			attributeName="r"
			values="0;0;{radius};0;0"
			keyTimes="0;0.2;0.5;0.8;1"
			begin="animate_tree_{id}.begin"
			dur="{duration}ms"
			calcMode="spline"
			keySplines="0 0 0 0;{bezierEasing.cubicOut};{bezierEasing.cubicIn};0 0 0 0"
			fill="freeze"
		/>
	</circle>
	<line
		stroke="var(--correct-color)"
		stroke-width="0"
		stroke-linecap="round"
		style:transform="scaleY({hover ? 0.7 : 1})"
		style:transition="transform {hover ? 50 : 200}ms ease-out"
	>
		<animate
			attributeName="y2"
			values="0;{-trunkLength - radius};{-trunkLength - radius};0"
			keyTimes="0;0.2;0.8;1"
			begin="animate_tree_{id}.begin"
			dur="{duration}ms"
			fill="freeze"
			calcMode="spline"
			keySplines="0 0 0 0;0 0 0 0;{bezierEasing.cubicOut}"
		/>
		<animate
			attributeName="stroke-width"
			values="0;{STROKE_WIDTH};{STROKE_WIDTH};0"
			keyTimes="0;0.1;0.9;1"
			begin="animate_tree_{id}.begin"
			dur="{duration}ms"
			fill="freeze"
			calcMode="spline"
			keySplines="{bezierEasing.expoIn};0 0 0 0;{bezierEasing.expoOut}"
		/>
	</line>
</g>
