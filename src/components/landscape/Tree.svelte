<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { bezierEasing } from '$lib/transitions'
	import { getDistance, randomInt, randomChance } from '$lib/math'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const pluckSpeed = 2.5 // TODO: Remove

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
	export let pluckMode: boolean

	export const featureType = 'tree'

	let willAnimate = true
	let animateOpacityElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement
	let animatePluckScaleElement: SVGAnimateElement

	let inColor = false
	$: inColor = forceColor
	let lastTimeout: NodeJS.Timer
	let skewX = 0
	let nudgeY = 1
	export function flashColor(x: number, y: number, duration: number) {
		const distance = getDistance(x - originX, y - centerY)
		const force = 4 - distance
		if (force > 0) {
			const xMagnitude = (x - originX) / distance
			const yMagnitude = (y - centerY) / distance
			skewX = xMagnitude * force * 4
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

	let plucked = false
	let pluckRotation = 0

	export function onMouseDown(x: number, y: number) {
		if (plucked) return
		const distance = getDistance(x - originX, y - centerY)
		const force = 2 - distance
		if (force < 0) return
		if (force > 1) {
			// Pluck it!
			// skewX = 0
			// nudgeY = 0.5
			// animateSkewElement?.beginElement()
			const pluckXDir = randomChance() ? 1 : -1
			pluckRotation = pluckXDir * randomInt(5, 40)
			animatePluckScaleElement?.beginElement()
			plucked = true
		} else {
			// Almost pluck
			const xMagnitude = (x - originX) / distance
			skewX = xMagnitude * force * -8
			nudgeY = force * 0.2
			animateSkewElement?.beginElement()
		}
	}

	$: growDuration = 800 * (0.8 + size * 0.4)

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
	$: circleY = -trunkLength - radius
	$: circleTranslateY = hover ? 0.3 : 0

	onMount(() => {
		willAnimate = animate
		if (animate) setTimeout(() => animateOpacityElement?.beginElement(), delay)
	})
</script>

<!-- Position relative to fix stacking context bug in FF -->
<g style:position="relative" transform="translate({originX} {originY})">
	<g opacity={willAnimate ? 0 : 1}>
		<animateTransform
			id="tree_nudge_animate_{id}"
			bind:this={animateSkewElement}
			attributeName="transform"
			type="skewX"
			begin="indefinite"
			values="0;{skewX};0"
			keyTimes="0;0.3;1"
			calcMode="spline"
			dur="600ms"
			keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
		/>
		<animateTransform
			id="tree_pluck_scale_animate_{id}"
			bind:this={animatePluckScaleElement}
			attributeName="transform"
			type="scale"
			begin="indefinite"
			dur="{60 * pluckSpeed}ms"
			calcMode="spline"
			values="1 1;1 1.5"
			keySplines={bezierEasing.cubicOut}
		/>
		<animateTransform
			attributeName="transform"
			type="translate"
			dur="{140 * pluckSpeed}ms"
			begin="tree_pluck_scale_animate_{id}.end"
			calcMode="spline"
			values="0 -0.5;0 -1;0 0"
			keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
		/>
		<g>
			<animateTransform
				attributeName="transform"
				type="rotate"
				dur="{140 * pluckSpeed}ms"
				begin="tree_pluck_scale_animate_{id}.end"
				calcMode="spline"
				values="0;{pluckRotation}"
				keySplines={bezierEasing.cubicOut}
			/>
			<line
				stroke="var(--tertiary-color)"
				stroke-width={STROKE_WIDTH * 2.5}
				stroke-linecap="round"
				y2={circleY + circleTranslateY}
			/>
			<circle
				cy={circleY}
				r={radius + STROKE_HALF * 1.5}
				fill="var(--tertiary-color)"
				style:transform="translateY({circleTranslateY}px)"
				style:transition="transform {hover ? 50 : 200}ms ease-out, r 200ms ease-out"
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
				y2={circleY + circleTranslateY}
				style:transition="fill {inColor ? 200 : 1000}ms ease, stroke {inColor
					? 200
					: 1000}ms ease"
			/>
			<g
				style:transform="translateY({circleTranslateY}px)"
				style:transition="transform {hover ? 50 : 200}ms ease-out"
			>
				<!-- Using a wrapper group to avoid transform/color easing bug in FF -->
				<circle
					cy={circleY}
					r={radius - STROKE_HALF}
					fill="var(--{inColor ? 'correct-color' : 'tertiary-color'})"
					stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
					stroke-width={STROKE_WIDTH}
					style:transition="fill {inColor ? 200 : 1000}ms ease, stroke {inColor
						? 200
						: 1000}ms ease, r 200ms ease-out"
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
				attributeName="opacity"
				begin="tree_pluck_scale_animate_{id}.end"
				values="1;0"
				calcMode="spline"
				keySplines={bezierEasing.cubicIn}
				dur="{100 * pluckSpeed}ms"
				fill="freeze"
			/>
		</g>
		<animate
			id="animate_tree_{id}"
			bind:this={animateOpacityElement}
			attributeName="opacity"
			values="0;0;1;1"
			keyTimes="0;0.4;0.6;1"
			begin="indefinite"
			dur="{growDuration}ms"
			fill="freeze"
		/>
	</g>
	<!-- Growth animation -->
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
			dur="{growDuration}ms"
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
			dur="{growDuration}ms"
			fill="freeze"
			calcMode="spline"
			keySplines="0 0 0 0;0 0 0 0;{bezierEasing.cubicOut}"
		/>
		<animate
			attributeName="stroke-width"
			values="0;{STROKE_WIDTH};{STROKE_WIDTH};0"
			keyTimes="0;0.1;0.9;1"
			begin="animate_tree_{id}.begin"
			dur="{growDuration}ms"
			fill="freeze"
			calcMode="spline"
			keySplines="{bezierEasing.expoIn};0 0 0 0;{bezierEasing.expoOut}"
		/>
	</line>
	{#if plucked}
		<circle
			r={STROKE_HALF}
			fill="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			style:transition="fill {inColor ? 200 : 1000}ms ease"
			class="stump"
		/>
	{/if}
</g>

<style>
	.stump {
		animation: fade 5s ease-in forwards;
	}

	@keyframes fade {
		100% {
			opacity: 0;
		}
	}
</style>
