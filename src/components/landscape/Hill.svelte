<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 0.2
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 900

	export let x: number
	export let y: number
	export let xJitter: number
	export let yJitter: number
	// export let width = 30
	// export let length = 10
	export let delay = 0
	let draw = false

	const hillPath = `M${STROKE_HALF} ${2.5 - STROKE_HALF} V${
		1.5 + STROKE_HALF
	} a1.5 1.5 0 0 1 3 0 V${2.5 - STROKE_HALF}`
	const fillRadius = 1.5 + STROKE_HALF
	const hillFillPath = `M0 2.5 V${1.5 + STROKE_HALF} a${fillRadius} ${fillRadius} 0 0 1 ${
		3 + STROKE_WIDTH
	} 0 V2.5`

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
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
	<!-- <text x={x * 1.5 + 0.5} y={y + 1.5} fill="#fff" style:font="1.5px sans-serif"
		>{x}:{y}</text
	> -->
	<svg x={(x + xJitter) * 1.5 + 0.75} y={y + yJitter - 1.5} height={2.5}>
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
		<svg y={2.5}>
			<path fill="#e38f2f" d={hillFillPath} />
			<animate
				attributeName="y"
				dur={DURATION / 2 + 'ms'}
				values={`${2.5};0`}
				calcMode="spline"
				keySplines={'0.54, 0, 0.68, 1'}
				fill="freeze"
			/>
			<animate
				attributeName="y"
				begin={DURATION / 2 + 'ms'}
				dur={DURATION / 3 + 'ms'}
				values={`0;${2.5}`}
				calcMode="spline"
				keySplines={bezierEasing.sineIn}
				fill="freeze"
			/>
		</svg>
	</svg>
{/if}
