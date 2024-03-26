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
	// TODO: Add length/width jitter
	// export let width = 30
	// export let length = 10
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
	$: hover =
		mouse && Math.max(Math.abs(centerX - mouseX), Math.abs(centerY - 1 - mouseY)) < 2

	const hillTopPath = 'M-1.5 -0.5 v-0.5 a1.5 1.5 0 0 1 3 0 v0.5'
	const hillBottomPath = 'M1.5 -0.6 v0.5 a1.5 0.5 0 0 1 -3 0 v-0.6'

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
				stroke="#312236"
				stroke-width={STROKE_WIDTH * 2}
				d={hillTopPath}
				style:transform="translateY({hover ? 0.4 : 0}px)"
				style:transition="transform {hover ? 100 : 200}ms ease-out"
			/>
			<path
				fill="none"
				stroke="#312236"
				stroke-width={STROKE_WIDTH * 2}
				d={hillBottomPath}
			/>
			<!-- <path transform="translate(0 0.2)" fill="#e38f2f" d={hillPath} /> -->
			<path
				stroke={inColor ? 'var(--before-color)' : 'var(--landscape-color)'}
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				fill={inColor ? 'var(--before-color)' : '#312236'}
				d={hillBottomPath}
			/>
			<path
				stroke={inColor ? 'var(--before-color)' : 'var(--landscape-color)'}
				stroke-width={STROKE_WIDTH}
				stroke-linecap="round"
				fill={inColor ? 'var(--before-color)' : '#312236'}
				d={hillTopPath}
				style:transform="translateY({hover ? 0.4 : 0}px)"
				style:transition="transform {hover ? 100 : 200}ms ease-out"
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
		<clipPath id="hilltop_clip_{id}">
			<rect
				x={-1.5 - STROKE_HALF}
				y={-2.5 - STROKE_HALF}
				width={3 + STROKE_WIDTH}
				height={2.5 + STROKE_HALF}
			/>
			<ellipse>
				<animate
					attributeName="rx"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0;{1.5 + STROKE_HALF};{1.5 + STROKE_HALF}"
					keyTimes="0;0.15;1"
					keySplines="{bezierEasing.circOut};0.5 0.5 0.5 0.5"
					calcMode="spline"
					fill="freeze"
				/>
				<animate
					attributeName="ry"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0;{0.5 + STROKE_HALF};{0.5 + STROKE_HALF}"
					keyTimes="0;0.15;1"
					keySplines="{bezierEasing.circOut};0.5 0.5 0.5 0.5"
					calcMode="spline"
					fill="freeze"
				/>
			</ellipse>
		</clipPath>
		<g clip-path="url(#hilltop_clip_{id})">
			<path
				d="M-1.5 1 v-2 a1.5 1.5 0 0 1 3 0 v2"
				fill="var(--before-color)"
				stroke="var(--before-color)"
			>
				<animateTransform
					attributeName="transform"
					type="translate"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0 2.5;0 1;0 0;0 3.5"
					keyTimes="0;0.15;0.6;1"
					keySplines="0.5 0.5 0.5 0.5;{bezierEasing.cubicOut};{bezierEasing.circIn}"
					calcMode="spline"
					fill="freeze"
				/>
				<animate
					attributeName="stroke-width"
					begin="hill_draw_animate_{id}.begin"
					dur="{DURATION}ms"
					values="0;{STROKE_WIDTH};{STROKE_WIDTH}"
					keyTimes="0;0.15;1"
					fill="freeze"
				/>
			</path>
		</g>
	</g>
{/if}
