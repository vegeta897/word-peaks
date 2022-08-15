<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 700

	export let x = 0
	export let y = 0
	export let width = 30
	export let length = 10
	export let delay = 0
	let draw = false

	let radius: number
	let height: number
	let hillPath: string
	let hillFillPath: string

	$: radius = width / 2
	$: height = radius + length
	$: hillPath = `M${STROKE_HALF} ${height - STROKE_HALF} V${radius} a${radius - STROKE_HALF} ${
		radius - STROKE_HALF
	} 0 0 1 ${width - STROKE_WIDTH} 0 v${length - STROKE_HALF}`
	$: hillFillPath = `M0 ${height} V${radius} a${radius} ${radius} 0 0 1 ${width} 0 v${length}`

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<svg {x} {y} {height}>
		<path
			opacity="0"
			stroke="#ffffff"
			stroke-linecap="round"
			stroke-width={STROKE_WIDTH}
			fill="#312236"
			d={hillPath}
		>
			<animate
				attributeName="opacity"
				values="0;1"
				dur={DURATION + 'ms'}
				calcMode="discrete"
				fill="freeze"
			/>
		</path>
		<svg y={height}>
			<path fill="#e38f2f" d={hillFillPath} />
			<animate
				attributeName="y"
				dur={DURATION / 2 + 'ms'}
				values={`${height};0`}
				calcMode="spline"
				keySplines={'0.54, 0, 0.68, 1'}
				fill="freeze"
			/>
			<animate
				attributeName="y"
				begin={DURATION / 2 + 'ms'}
				dur={DURATION / 3 + 'ms'}
				values={`0;${height}`}
				calcMode="spline"
				keySplines={bezierEasing.sineIn}
				fill="freeze"
			/>
		</svg>
	</svg>
{/if}
