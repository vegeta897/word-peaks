<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 900

	export let id: number
	export let x: number
	export let y: number
	export let xJitter: number
	export let yJitter: number
	export let size: number
	export let delay = 0
	export let mouse: boolean
	export let mouseX: number
	export let mouseY: number

	let animateElement: SVGAnimateElement

	export function redraw(/*delay = 0*/) {
		if (delay) setTimeout(() => animateElement?.beginElement(), delay)
		else animateElement?.beginElement()
	}

	let draw = false
	let inColor = false

	$: centerX = (x + xJitter + 1.5) * 1.5
	$: centerY = y + yJitter + 1
	$: radius = 1.35 + 0.2 * size
	$: hover =
		mouse &&
		Math.abs(centerX - mouseX) < radius + STROKE_HALF &&
		Math.abs(centerY - 1 - mouseY) < radius + STROKE_HALF

	$: hillTopPath = `M-${radius} -0.5 v-0.5 a${radius} ${radius} 0 0 1 ${
		radius * 2
	} 0 v0.5`
	$: hillBottomPath = `M${radius} -0.6 v0.6 a${radius} ${radius / 3} 0 0 1 -${
		radius * 2
	} 0 v-0.6`
	$: hillAnimationClip = `M${-radius - STROKE_HALF} 0 v${-2.5 - STROKE_HALF} h${
		radius * 2 + STROKE_WIDTH
	} v${2.5 + STROKE_HALF} a${radius + STROKE_HALF} ${radius / 3 + STROKE_HALF} 0 0 1 ${
		-radius * 2 - STROKE_WIDTH
	} 0`

	onMount(() => setTimeout(() => (draw = true), delay))
	$: animateElement?.beginElement()
</script>

{#if draw}
	<!-- <rect
		x={x * 1.5}
		{y}
		width="4.5"
		height="2"
		fill="#e38f2f40"
		stroke="#e38f2f"
		stroke-width="0.1"
	/> -->
	<g transform="translate({centerX} {centerY})" height={2.5 + 0.7}>
		<g>
			<path
				fill="none"
				stroke="var(--tertiary-color)"
				stroke-width={STROKE_WIDTH * 2}
				d={hillTopPath}
				style:transform="translateY({hover ? 0.4 : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out"
			/>
			<path
				fill="none"
				stroke="var(--tertiary-color)"
				stroke-width={STROKE_WIDTH * 2}
				d={hillBottomPath}
			/>
			<!-- <path transform="translate(0 0.2)" fill="#e38f2f" d={hillPath} /> -->
			<path
				stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
				d={hillBottomPath}
			/>
			<path
				stroke="var(--{inColor ? 'before-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				fill="var(--{inColor ? 'before-color' : 'tertiary-color'})"
				d={hillTopPath}
				style:transform="translateY({hover ? 0.4 : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out"
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
				style:transform="translateY({hover ? 0.4 : 0}px)"
				style:transition="transform {hover ? 75 : 200}ms ease-out"
			>
				<path
					d="M-{radius} 1 v-2 a{radius} {radius} 0 0 1 {radius * 2} 0 v2"
					fill="var(--before-color)"
					stroke="var(--before-color)"
					stroke-width={STROKE_WIDTH}
				>
					<animateTransform
						attributeName="transform"
						type="translate"
						begin="hill_draw_animate_{id}.begin"
						dur="{DURATION}ms"
						values="0 3.3;0 0;0 3.3"
						keyTimes="0;0.6;1"
						keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
						calcMode="spline"
						fill="freeze"
					/>
				</path>
			</g>
		</g>
	</g>
{/if}
