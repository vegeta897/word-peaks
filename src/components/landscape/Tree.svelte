<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 500

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

	// TODO: Make default values of animated elements be their end states, so that the animate elements can be conditional

	// TODO: Randomize animation speed (seeded in landscape.ts)

	$: width = size * 0.2 + 0.9
	$: length = width / 2
	$: radius = width / 2

	$: centerX = (x + xJitter + 0.5) * 1.5
	$: centerY = y + yJitter + 0.5
	$: hover =
		mouse &&
		Math.max(Math.abs(centerX - mouseX), Math.abs(centerY - length - radius - mouseY)) <
			1.5

	onMount(() => setTimeout(() => (draw = true), delay))
	$: animateElement?.beginElement()
</script>

{#if draw}
	<!-- <rect
		x={x * 1.5}
		{y}
		width="1.5"
		height="1"
		fill="#15a85040"
		stroke="#15a850"
		stroke-width="0.1"
	/> -->
	<g transform="translate({centerX} {centerY})">
		<g>
			<line
				stroke="var(--tertiary-color)"
				stroke-width={STROKE_WIDTH * 2}
				stroke-linecap="round"
				y2={-length}
			/>
			<circle
				cy={-length - radius}
				r={radius + STROKE_HALF}
				fill="var(--tertiary-color)"
				style:transform="translateY({hover ? 0.3 : 0}px)"
				style:transition="transform {hover ? 100 : 200}ms ease-out"
			/>
			<line
				stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				y2={-length}
			/>
			<circle
				cy={-length - radius}
				r={radius - STROKE_HALF}
				fill="var(--{inColor ? 'correct-color' : 'tertiary-color'})"
				stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
				stroke-width={STROKE_WIDTH}
				style:transform="translateY({hover ? 0.3 : 0}px)"
				style:transition="transform {hover ? 100 : 200}ms ease-out"
			/>
			<!-- Change to circle radius? -->
			<animate
				attributeName="opacity"
				values="0;0;1;1"
				keyTimes="0;0.4;0.6;1"
				begin="tree_draw_animate_{id}.begin"
				dur="{DURATION * 2}ms"
				fill="freeze"
			/>
		</g>
		<circle cy={-length - radius} r="0" fill="var(--correct-color)">
			<animate
				attributeName="r"
				values={`0;${radius};0`}
				begin="tree_draw_animate_{id}.begin+{DURATION * 0.4 + 'ms'}"
				dur="{DURATION * 1.1}ms"
				calcMode="spline"
				keySplines={`${bezierEasing.cubicOut};${bezierEasing.cubicIn}`}
				fill="freeze"
			/>
		</circle>
		<line
			stroke="var(--correct-color)"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
		>
			<animate
				bind:this={animateElement}
				attributeName="y2"
				id="tree_draw_animate_{id}"
				values={`0;${-length - radius};${-length - radius};0`}
				keyTimes="0;0.25;0.75;1"
				begin="indefinite"
				dur="{DURATION * 2}ms"
				fill="freeze"
				calcMode="spline"
				keySplines={`${bezierEasing.sineOut};0,0,0,0;${bezierEasing.cubicOut}`}
			/>
			<animate
				attributeName="stroke-width"
				values="{STROKE_WIDTH};{STROKE_WIDTH};0"
				keyTimes="0;0.9;1"
				begin="tree_draw_animate_{id}.begin"
				dur="{DURATION * 2}ms"
				fill="freeze"
			/>
		</line>
	</g>
{/if}
