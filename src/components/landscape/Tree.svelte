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
	// TODO: Add length/width jitter
	export let width = 1
	export let length = 0.5
	export let delay = 0

	let animateElement: SVGAnimateElement

	export function redraw(delay = 0) {
		if (delay) setTimeout(() => animateElement?.beginElement(), delay)
		else animateElement?.beginElement()
	}

	let draw = false
	let inColor = false

	// TODO: Make default values of animated elements be their end states, so that the animate elements can be conditional

	// TODO: Randomize animation speed (seeded in landscape.ts)
	// Use x to determine delay?

	// TODO: Use something slightly dimmer than #ffffff

	let radius: number

	$: radius = width / 2

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
	<g transform="translate({(x + xJitter) * 1.5 + 0.25} {y + yJitter - 1})">
		{#if inColor}
			<line
				stroke="#312236"
				stroke-width={STROKE_WIDTH * 2}
				stroke-linecap="round"
				x1={radius}
				y1={width}
				x2={radius}
				y2={width + length - STROKE_HALF}
			/>
			<circle cx={radius} cy={radius} r={radius + STROKE_HALF} fill="#312236" />
			<line
				stroke="#15a850"
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				x1={radius}
				y1={width}
				x2={radius}
				y2={width + length}
			/>
			<circle cx={radius} cy={radius} r={radius} fill="#15a850" />
		{:else}
			<g>
				<line
					stroke="#312236"
					stroke-width={STROKE_WIDTH * 2}
					stroke-linecap="round"
					x1={radius}
					y1={width}
					x2={radius}
					y2={width + length - STROKE_HALF}
				/>
				<circle cx={radius} cy={radius} r={radius + STROKE_HALF} fill="#312236" />
				<rect
					rx={radius - STROKE_HALF}
					ry={radius - STROKE_HALF}
					x={STROKE_HALF}
					y={STROKE_HALF}
					width={width - STROKE_WIDTH}
					height={width - STROKE_WIDTH}
					fill="#312236"
					stroke="#ffffff"
					stroke-width={STROKE_WIDTH}
				/>
				<line
					stroke="#ffffff"
					stroke-width={STROKE_WIDTH}
					stroke-linecap="round"
					x1={radius}
					y1={width}
					x2={radius}
					y2={width + length}
				/>
				<animate
					attributeName="opacity"
					values="0;0;1;1"
					keyTimes="0;0.4;0.6;1"
					begin="tree_draw_animate_{id}.begin"
					dur="{DURATION * 2}ms"
					fill="freeze"
				/>
			</g>
		{/if}
		<circle cx={radius} cy={radius} r="0" fill="#15a850">
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
			stroke="#15a850"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			x1={radius}
			y1={width + length}
			x2={radius}
			y2={width + length}
		>
			<animate
				bind:this={animateElement}
				attributeName="y1"
				id="tree_draw_animate_{id}"
				values={`${width + length};${radius};${radius};${width + length}`}
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
