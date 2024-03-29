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
	export let delay = 0
	export let mouseOver: boolean
	export let mouseX: number
	export let mouseY: number

	let animateElement: SVGAnimateElement

	let lastTimeout: NodeJS.Timer
	export function flashColor(x: number, y: number, durationExtension: number) {
		const distance = getDistance(x - centerX, y - centerY)
		setTimeout(async () => {
			inColor = true
			const thisTimeout = setTimeout(async () => {
				if (lastTimeout === thisTimeout) inColor = false
			}, 400 + durationExtension)
			lastTimeout = thisTimeout
		}, distance * 50)
	}

	let inColor = false
	$: duration = BASE_DURATION * (0.8 + size * 0.4)

	$: width = size * 0.2 + 0.9
	$: length = width / 2
	$: radius = width / 2

	// TODO: Add bounds to prevent drawing off-canvas
	$: centerX = (x + xJitter + 0.5) * 1.5
	$: centerY = y + yJitter + 0.5
	$: hover =
		mouseOver &&
		Math.max(Math.abs(centerX - mouseX), Math.abs(centerY - length - radius - mouseY)) <
			1.5

	onMount(() => setTimeout(() => animateElement?.beginElement(), delay))
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
<g transform="translate({centerX} {centerY})">
	<g opacity="0">
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
			style:transition="transform {hover ? 50 : 200}ms ease-out"
		/>
		<line
			stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			stroke-linecap="round"
			y2={-length}
			style:transition="fill 200ms ease, stroke 200ms ease"
		/>
		<circle
			cy={-length - radius}
			r={radius - STROKE_HALF}
			fill="var(--{inColor ? 'correct-color' : 'tertiary-color'})"
			stroke="var(--{inColor ? 'correct-color' : 'landscape-color'})"
			stroke-width={STROKE_WIDTH}
			style:transform="translateY({hover ? 0.3 : 0}px)"
			style:transition="transform {hover ? 50 : 200}ms ease-out, fill 200ms ease, stroke
			200ms ease"
		/>
		<!-- Change to circle radius? -->
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
		cy={-length - radius}
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
			values="0;{-length - radius};{-length - radius};0"
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
