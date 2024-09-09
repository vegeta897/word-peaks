<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'
	import {
		getDistance,
		randomInt,
		randomChance,
		type XY,
		randomFloat,
		sleep,
	} from '$lib/math'

	export const featureType = 'tree'

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

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2

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

	let plucking = false
	let plucked = false
	let pluckRotation = 0
	let fallingLeaves: [
		...XY,
		fallDuration: number,
		flickerDuration: number,
		flickerDelay: number
	][] = []

	export function doFun(x: number, y: number) {
		if (plucking) return
		const xDistance = x - originX
		const yDistance = y - centerY
		if (
			Math.abs(xDistance) < radius * 1.5 &&
			yDistance < radius * 2.5 &&
			yDistance > -radius * 1.5
		) {
			// Pluck it!
			plucking = true
			sleep((xDistance + yDistance / 2) * 200).then(() => {
				const pluckXDir = randomChance() ? 1 : -1
				pluckRotation = pluckXDir * randomInt(5, 40)
				animatePluckScaleElement?.beginElement()
				plucked = true
				for (let i = 0; i < 10 + size * 6; i++) {
					fallingLeaves.push([
						pluckRotation / 60 + randomFloat(-1, 1),
						circleY - 1 + randomFloat(-0.7, 0.7),
						randomInt(1600, 3000),
						randomInt(500, 1300),
						randomInt(400, 1000),
					])
				}
				sleep(5200).then(() => (fallingLeaves.length = 0)) // Clean up leaves
			})
			return true
		} else {
			// Almost pluck
			const distance = getDistance(xDistance, yDistance)
			const force = 2 - distance
			if (force < 0) return
			const xMagnitude = xDistance / distance
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
<g
	class="tree"
	class:fade={plucked}
	style:position="relative"
	transform="translate({originX} {originY})"
>
	<g opacity={willAnimate ? 0 : 1}>
		<g>
			<animateTransform
				attributeName="transform"
				type="rotate"
				dur="350ms"
				begin="tree_pluck_scale_animate_{id}.end"
				calcMode="spline"
				values="0;{pluckRotation}"
				keySplines={bezierEasing.cubicOut}
			/>
			<line
				stroke={plucked ? '#0000' : 'var(--tertiary-color)'}
				stroke-width={STROKE_WIDTH * 2.5}
				stroke-linecap="round"
				y2={circleY + circleTranslateY}
				style:transition="stroke 200ms ease-in"
			/>
			<circle
				cy={circleY}
				r={radius + STROKE_HALF * 1.5}
				fill={plucked ? '#0000' : 'var(--tertiary-color)'}
				style:transform="translateY({circleTranslateY}px)"
				style:transition="transform {hover ? 50 : 200}ms ease-out, r 200ms ease-out, fill
				200ms ease-in"
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
				style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease, stroke {inColor
					? 200
					: 1000}ms {y * 20}ms ease"
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
					style:transition="fill {inColor ? 200 : 1000}ms {y * 20}ms ease, stroke {inColor
						? 200
						: 1000}ms {y * 20}ms ease, r 200ms ease-out"
					class:plucked-treetop={plucked}
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
				dur="250ms"
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
			dur="150ms"
			calcMode="spline"
			values="1 1;1 1.5"
			keySplines={bezierEasing.cubicOut}
		/>
		<animateTransform
			attributeName="transform"
			type="translate"
			dur="350ms"
			begin="tree_pluck_scale_animate_{id}.end"
			calcMode="spline"
			values="0 -0.5;0 -1;0 0"
			keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
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
		/>
		{#each fallingLeaves as [leafX, leafY, fallDuration, flickerDuration, flickerDelay]}
			<g style:transform="translate({leafX}px,{leafY}px)" class="burst">
				<g
					class="falling"
					style:transform="translate({(Math.round(leafX * 5) % 10) * 0.05}px,2px)"
					style:animation-duration="{fallDuration}ms"
				>
					<circle
						style:animation="shimmer"
						style:animation-iteration-count={Math.floor(
							(fallDuration - flickerDelay) / flickerDuration
						)}
						style:animation-duration="{flickerDuration}ms"
						style:animation-delay="{flickerDelay}ms"
						r={STROKE_HALF}
						fill="var(--{inColor ? 'correct-color' : 'landscape-color'})"
					/>
				</g>
			</g>
		{/each}
	{/if}
</g>

<style>
	.tree.fade {
		animation: fade 1s 4.2s ease-in forwards;
	}

	@keyframes fade {
		100% {
			opacity: 0;
		}
	}

	.burst {
		animation: burst 200ms 100ms cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	@keyframes burst {
		0% {
			transform: translate(0, -1px) scale(4);
			opacity: 0;
		}
	}

	.falling {
		animation: move-from-center 1s 100ms cubic-bezier(0.42, 0, 0.85, 1) both;
	}

	@keyframes move-from-center {
		0% {
			transform: translate(0, 0);
		}
	}

	@keyframes -global-shimmer {
		0% {
			animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0);
		}
		50% {
			animation-timing-function: cubic-bezier(0.2, 1, 0.8, 1);
			opacity: 0.3;
		}
		100% {
			opacity: 1;
		}
	}

	.plucked-treetop {
		animation: expand 400ms 100ms forwards, fade 400ms 100ms forwards;
	}

	@keyframes expand {
		100% {
			transform: scale(1.7);
		}
	}
</style>
