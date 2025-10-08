<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { bezierEasing } from '$lib/animation'
	import {
		getDistance,
		randomInt,
		type XY,
		randomFloat,
		sleep,
		getDistanceSquared,
	} from '$lib/math'
	import { fade } from 'svelte/transition'
	import { type Interaction } from '$lib/landscape/fun'
	import { leafCount, reduceMotion } from '$src/store'
	import { sineIn } from 'svelte/easing'

	export const featureType = 'tree'
	export const funStatus = { done: false, clean: false }

	export let id: number
	export let x: number
	export let y: number
	export let xJitter = 0
	export let yJitter = 0
	export let size = 1
	export let animate: boolean
	export let delay = 0
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number
	export let forceColor: boolean
	export let pluckMode: boolean

	const STROKE_WIDTH = 0.2 * 10
	const STROKE_HALF = STROKE_WIDTH / 2

	let willAnimate = true
	let animationFinished = true
	let animateOpacityElement: SVGAnimateElement
	let animateSkewElement: SVGAnimateTransformElement
	let animatePluckElement: SVGAnimateElement

	let inColor = false
	$: inColor = forceColor
	let lastTimeout: NodeJS.Timer
	let skewX = 0
	let nudgeY = 10
	export function flashColor(x: number, y: number, duration: number) {
		const distance = getDistance(x - originX, y - centerY)
		const force = 40 - distance
		if (force > 0) {
			const xMagnitude = (x - originX) / distance
			const yMagnitude = (y - centerY) / distance
			skewX = xMagnitude * force * 0.4
			nudgeY = (yMagnitude * force) / 240
			animateSkewElement?.beginElement()
		}
		if (forceColor) return
		const flashDelay = distance * 7
		setTimeout(() => (inColor = true), flashDelay)
		const thisTimeout = setTimeout(() => {
			if (lastTimeout === thisTimeout) inColor = forceColor
		}, Math.max(duration, flashDelay))
		lastTimeout = thisTimeout
	}

	const PLUCK_RANGE = 10
	const PLUCK_DISTANCE = 25
	let willBurst = false
	let bursting = false
	let bursted = false
	let burstGestureId: null | number = null
	let plucked = false
	let pluckStartXY: null | XY = null
	let trunkTipDeltaXY: XY = [0, 0]
	let pluckForce = 0
	let pluckAngle = 0
	let halfPluckLength = 0
	let pluckRotation = 0
	let pluckDuration = 200
	let trunkOrigin: XY = [0, 0]
	let fallingLeaves: [
		...XY,
		fallDuration: number,
		flickerDuration: number,
		flickerDelay: number
	][] = []
	let burstLeaves: XY[] = []

	export function doFun(
		x: number,
		y: number,
		{ gestureId, touch, pointerUp }: Interaction
	): void | number {
		if (willBurst || plucked) return
		const xDistance = x - originX
		const yDistance = y - centerY
		if (!bursting && !bursted) {
			if (pointerUp) return
			const checkRadiusSquared = (radius * (touch ? 3 : 2)) ** 2
			const distanceSquared = getDistanceSquared(xDistance, yDistance)
			if (distanceSquared < checkRadiusSquared) {
				// Burst it!
				willBurst = true
				burstGestureId = gestureId
				const burstDelay = Math.max(0, distanceSquared - checkRadiusSquared / 2)
				sleep(burstDelay).then(() => {
					willBurst = false
					bursting = true
					let fallingLeafCount = Math.ceil(10 + size * 6)
					let burstLeafCount = 6
					let fallDuration = randomInt(1500, 2400)
					let cleanupDelay = fallDuration - 800
					leafCount.update((count) => {
						const reduction = Math.max(1, count / 30)
						fallingLeafCount = Math.max(4, Math.ceil(fallingLeafCount / reduction))
						burstLeafCount = Math.max(4, Math.ceil(burstLeafCount / reduction))
						cleanupDelay = Math.round(cleanupDelay / (Math.max(3, reduction) / 3))
						return count + fallingLeafCount
					})
					for (let i = 0; i < fallingLeafCount; i++) {
						fallingLeaves.push([
							-xDistance + randomFloat(-13, 13),
							circleY + randomFloat(-9, 9),
							fallDuration,
							randomInt(500, 1300),
							randomInt(400, 1000),
						])
					}
					for (let i = 0; i < burstLeafCount; i++) {
						burstLeaves.push([-xDistance + randomFloat(-8, 8), randomFloat(-6, 6)])
					}
					sleep(cleanupDelay).then(() => {
						bursting = false
						bursted = true
						leafCount.update((count) => Math.max(0, count - fallingLeafCount))
					})
				})
			}
			return
		}
		if (pluckStartXY === null && !pointerUp) {
			if (gestureId === burstGestureId) return // Can't pluck in same gesture as burst
			const distance = getDistance(xDistance, yDistance)
			if (distance <= PLUCK_RANGE * (touch ? 1.5 : 1)) {
				pluckStartXY = [x, y]
			}
			return
		}
		if (pluckStartXY) {
			const pluckDistance = PLUCK_DISTANCE * (touch ? 1.5 : 1)
			if (pointerUp) {
				// Pluck if released near top edge
				if (y < 1.5) {
					y = centerY - pluckDistance - 0.1
				} else {
					pluckStartXY = null
					trunkTipDeltaXY = [0, 0]
					return
				}
			}
			const cursorDistance = getDistance(x - originX, y - centerY)
			if (cursorDistance > pluckDistance) {
				// Pluck it
				funStatus.done = true
				plucked = true
				trunkOrigin = [trunkTipDeltaXY[0] / 2, (trunkTipDeltaXY[1] - trunkLength) / 2]
				halfPluckLength = getDistance(...trunkOrigin)
				pluckAngle = Math.atan2(trunkOrigin[1], trunkOrigin[0]) * (180 / Math.PI) + 90
				pluckRotation = Math.sign(trunkOrigin[0]) * randomInt(180, 300)
				pluckForce = randomInt(20, 40) / 10
				pluckDuration = randomInt(100, 250)
				tick().then(() => animatePluckElement?.beginElement())
				return 200
			}
			const dragDeltaXY: XY = [x - pluckStartXY[0], y - pluckStartXY[1]]
			const dragDistance = getDistance(...dragDeltaXY)
			const cursorWeight = Math.min(cursorDistance, dragDistance) / pluckDistance
			dragDeltaXY[0] += (x - originX - dragDeltaXY[0]) * cursorWeight
			dragDeltaXY[1] += (y - centerY - dragDeltaXY[1]) * cursorWeight
			const dampener = 1 - sineIn(cursorDistance / pluckDistance) * 0.35
			trunkTipDeltaXY = [dragDeltaXY[0] * dampener, dragDeltaXY[1] * dampener]
		}
		return
	}

	let filling = false
	let filled = false
	let fillDistance = 0
	let fillDelay = 0
	let fillDuration = 0
	let fillFromXY: XY

	export function fillIn(x: number, y: number): number {
		if (filling) return 0
		filling = true
		const xDelta = x - originX
		const yDelta = y - originY
		fillFromXY = [xDelta, yDelta]
		fillDistance = getDistance(xDelta, yDelta)
		fillDelay = fillDistance * 10
		fillDuration = 500 + fillDistance * 15
		sleep(fillDuration).then(() => (filled = true))
		return fillDelay + fillDuration
	}

	$: growDuration = 800 * (0.8 + size * 0.4)

	$: width = 8.5 + size * 0.25 * 10
	$: trunkLength = width
	$: radius = width / 2

	$: originX = (x + xJitter + 0.5) * 1.5 * 10
	$: originY = (y + yJitter + 0.5) * 10
	$: centerY = originY - trunkLength
	$: hover =
		!$reduceMotion &&
		!pluckMode &&
		mouseOver &&
		Math.abs(originX - mouseX) < radius * 1.5 &&
		Math.abs(centerY - mouseY) < radius * 1.5
	$: circleY = -trunkLength
	$: circleTranslateY = hover ? 3 : 0

	onMount(async () => {
		willAnimate = animate
		if (animate) {
			animationFinished = false
			await sleep(delay)
			animateOpacityElement?.beginElement()
			await sleep(growDuration)
			animationFinished = true
		}
	})
</script>

<!-- Position relative to fix stacking context bug in FF -->
<g class="tree" style:position="relative" transform="translate({originX} {originY})">
	{#if !bursting && !bursted}
		<g opacity={willAnimate ? 0 : 1}>
			<g>
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
					style:transition="stroke {inColor ? 200 : 1000}ms {y * 20}ms ease"
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
		</g>
		<!-- Growth animation -->
		{#if animate && !animationFinished}
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
		{/if}
	{:else}
		<!-- Fun -->
		<g
			opacity={filled ? 0 : 1}
			style:transition="opacity 0.5s 1.5s cubic-bezier(0.32, 0, 0.67, 0)"
		>
			<circle
				r={plucked ? STROKE_HALF : 0}
				fill={plucked
					? '#0006'
					: `var(--${inColor ? 'correct-color' : 'landscape-color'})`}
				style:transition="fill 2s"
			/>
			{#if filling}
				<path
					class="fill-line"
					d="M0,0 C0,-{fillDistance} {fillFromXY[0] / 1.2},{fillFromXY[1] -
						fillDistance} {fillFromXY.join(',')}"
					fill="none"
					stroke="var(--accent-color)"
					stroke-width={STROKE_WIDTH}
					stroke-linecap="round"
					style:stroke-dashoffset={fillDistance * -2}
					style:animation-delay="{fillDelay}ms"
					style:animation-duration="{fillDuration}ms"
				/>
			{/if}
		</g>
		<path
			stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			d="M0,0 L{trunkTipDeltaXY[0]},{circleY + trunkTipDeltaXY[1]}"
			style:transition="stroke {inColor ? 200 : 1000}ms {y * 20}ms ease{pluckStartXY
				? ''
				: ', d 50ms cubic-bezier(0.33, 1, 0.68, 1)'}"
		>
			<animate
				id="tree_pluck_animate_{id}"
				bind:this={animatePluckElement}
				attributeName="d"
				begin="indefinite"
				dur="{pluckDuration}ms"
				calcMode="spline"
				keyTimes="0;1"
				values="M0,{halfPluckLength} V{-halfPluckLength};M0,{trunkLength /
					2} V{-trunkLength / 2}"
				keySplines={bezierEasing.cubicOut}
				fill="freeze"
			/>
			<animateTransform
				attributeName="transform"
				type="translate"
				begin="tree_pluck_animate_{id}.begin"
				values="0 {trunkOrigin[1]};0 {-Math.abs(trunkOrigin[1]) - 6};0 {trunkOrigin[1]}"
				calcMode="spline"
				dur="{pluckDuration + 200}ms"
				keySplines="{bezierEasing.sineOut};{bezierEasing.sineIn}"
				fill="freeze"
			/>
			<animateTransform
				attributeName="transform"
				type="translate"
				begin="tree_pluck_animate_{id}.begin"
				values="{trunkOrigin[0]} 0;{trunkOrigin[0] * pluckForce} 0"
				dur="{pluckDuration + 200}ms"
				fill="freeze"
				additive="sum"
			/>
			<animateTransform
				attributeName="transform"
				type="rotate"
				begin="tree_pluck_animate_{id}.begin"
				values="{pluckAngle};{pluckAngle + pluckRotation}"
				calcMode="spline"
				dur="500ms"
				keySplines={bezierEasing.sineOut}
				fill="freeze"
				additive="sum"
			/>
			<animate
				attributeName="opacity"
				begin="tree_pluck_animate_{id}.end"
				values="1;0"
				calcMode="spline"
				keySplines={bezierEasing.cubicIn}
				dur="200ms"
				fill="freeze"
			/>
		</path>
		{#if willBurst || bursting}
			<g out:fade|local={{ duration: 500 }} style:transform="translateY({circleY}px)">
				{#each fallingLeaves as [leafX, leafY, fallDuration, flickerDuration, flickerDelay], l}
					<g
						style:transform="translate({leafX}px,{leafY}px)"
						class="burst"
						style:animation-delay="{0 + l * 10}ms"
					>
						<g
							class="falling"
							style:transform="translate({(Math.round(leafX * 5) % 10) * 0.2}px,20px)"
							style:animation-duration="{fallDuration}ms"
						>
							<circle
								style:animation="shimmer"
								style:animation-iteration-count={Math.floor(
									(fallDuration - flickerDelay) / flickerDuration
								)}
								style:animation-duration="{flickerDuration}ms"
								style:animation-delay="{flickerDelay}ms"
								r={STROKE_WIDTH * (0.3 + (fallDuration % 4) / 16)}
								fill="var(--{inColor ? 'correct-color' : 'landscape-color'})"
							/>
						</g>
					</g>
				{/each}
				<g class="burst-group">
					{#each burstLeaves as [leafX, leafY], l}
						<g
							style:transform="translate({leafX}px,{leafY}px)"
							class="burst"
							style:animation-delay="{l * 10}ms"
						>
							<circle
								r={STROKE_HALF * 1.5}
								fill="var(--{inColor ? 'correct-color' : 'landscape-color'})"
							/>
						</g>
					{/each}
				</g>
			</g>
		{/if}
	{/if}
</g>

<style>
	.burst-group {
		animation: fade 200ms 50ms ease-in forwards;
	}

	@keyframes fade {
		100% {
			opacity: 0;
		}
	}

	.burst {
		animation: burst 200ms cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	@keyframes burst {
		0% {
			transform: translate(0, 0) scale(6);
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

	.fill-line {
		stroke-dasharray: 5 1000;
		animation: fill-line-dash 2s both cubic-bezier(0, 0.5, 1, 1);
	}

	@keyframes fill-line-dash {
		100% {
			stroke-dashoffset: 4.9;
		}
	}
</style>
