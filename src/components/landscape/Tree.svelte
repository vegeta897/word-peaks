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
	export let mouseDown: boolean
	export let mouseX: number
	export let mouseY: number
	export let forceColor: boolean
	export let pluckMode: boolean

	let willAnimate = true
	let animateElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement

	let inColor = false
	$: inColor = forceColor
	let lastTimeout: NodeJS.Timer
	let nudgeX = 0
	let nudgeY = 1
	export function flashColor(x: number, y: number, duration: number) {
		const distance = getDistance(x - originX, y - centerY)
		const force = 4 - distance
		if (force > 0) {
			const xMagnitude = (x - originX) / distance
			const yMagnitude = (y - centerY) / distance
			nudgeX = xMagnitude * force * 4
			nudgeY = (yMagnitude * force) / 24
			animateSkewElement?.beginElement()
		}
		if (forceColor) return
		const flashDelay = distance * 70
		setTimeout(() => (inColor = true), flashDelay)
		const thisTimeout = setTimeout(() => {
			if (lastTimeout === thisTimeout) inColor = forceColor
		}, Math.max(duration, flashDelay))
		lastTimeout = thisTimeout
	}

	let plucking = false
	let plucked = false

	function onPluckMouseDown() {
		if (plucking) return
		const distance = getDistance(
			mouseX - originX,
			mouseY - (originY - trunkLength - radius)
		)
		if (distance > radius * 1.8) return
		plucking = true
	}

	$: duration = BASE_DURATION * (0.8 + size * 0.4)

	$: width = 0.85 + size * 0.25
	$: trunkLength = width / 2
	$: radius = width / 2

	$: originX = (x + xJitter + 0.5) * 1.5
	$: originY = y + yJitter + 0.5
	$: centerY = originY - trunkLength - radius
	$: hover =
		!pluckMode &&
		mouseOver &&
		Math.abs(originX - mouseX) < radius * 1.5 &&
		Math.abs(centerY - mouseY) < radius * 1.5
	$: if (!plucked && pluckMode && mouseDown) onPluckMouseDown()
	$: if (!mouseDown || !pluckMode) plucking = false
	$: if (!plucked && plucking && getDistance(originX - mouseX, centerY - mouseY) > 3) {
		plucked = true
		plucking = false
	}
	$: circleX = plucking ? mouseX - originX : 0
	$: circleY = plucking ? mouseY - originY : -trunkLength - radius

	onMount(() => {
		willAnimate = animate
		if (animate) setTimeout(() => animateElement?.beginElement(), delay)
	})
</script>

<!-- Position relative to fix stacking context bug in FF -->
<g style:position="relative" transform="translate({originX} {originY})">
	{#if !plucked}
		<g opacity={willAnimate ? 0 : 1}>
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
				x2={circleX}
				y2={circleY}
			/>
			<circle
				cx={circleX}
				cy={circleY}
				r={radius + STROKE_HALF * 1.5}
				fill="var(--tertiary-color)"
				style:transform="translateY({hover ? 0.3 : 0}px)"
				style:transition="transform {hover ? 50 : 200}ms ease-out"
			>
				<animate
					attributeName="cy"
					begin="tree_nudge_animate_{id}.begin"
					values="{circleY};{circleY - nudgeY};{circleY}"
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
				x2={circleX}
				y2={circleY}
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
					cx={circleX}
					cy={circleY}
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
						values="{circleY};{circleY - nudgeY};{circleY}"
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
			cy={circleY}
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
				values="0;{circleY};{circleY};0"
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
	{:else}
		<circle
			r={STROKE_HALF}
			fill="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			style:transition="fill {inColor ? 200 : 1000}ms ease"
		/>
	{/if}
</g>
