<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 500

	export let x = 0
	export let y = 0
	export let width = 12
	export let length = 8
	export let delay = 0
	let draw = false

	// TODO: Make default values of animated elements be their end states, so that the animate elements can be conditional

	// TODO: Randomize animation speed (seeded in landscape.ts)
	// Use x to determine delay?

	// TODO: Use something slightly dimmer than #ffffff

	let radius: number

	$: radius = width / 2

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<rect
		x={x * 1.5}
		{y}
		width="1.5"
		height="1"
		fill="#15a85040"
		stroke="#15a850"
		stroke-width="0.1"
	/>
	<!-- <svg {x} {y}>
		<g>
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
				keyTimes="0;0.5;0.6;1"
				dur={DURATION * 1.6 + 'ms'}
				calcMode="discrete"
				fill="freeze"
			/>
		</g>
		<circle cx={radius} cy={radius} r="0" fill="#15a850">
			<animate
				attributeName="r"
				values={`0;${radius};0`}
				begin={DURATION / 2 + 'ms'}
				dur={DURATION + 'ms'}
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
				attributeName="y1"
				values={`${width + length};${radius};${radius};${width + length}`}
				keyTimes="0;0.25;0.75;1"
				dur={DURATION * 2 + 'ms'}
				fill="freeze"
				calcMode="spline"
				keySplines={`${bezierEasing.sineOut};0,0,0,0;${bezierEasing.cubicOut}`}
			/>
			<animate
				attributeName="opacity"
				values="1;0"
				begin={DURATION * 2 + 'ms'}
				dur="1ms"
				fill="freeze"
				calcMode="discrete"
			/>
		</line>
	</svg> -->
{/if}
