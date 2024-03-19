<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 0.05
	const STROKE_HALF = STROKE_WIDTH / 2
	const DURATION = 700

	export let x = 0
	export let y = 0
	// export let width = 30
	// export let length = 10
	export let delay = 0
	let draw = false

	let hillPath: string
	let hillFillPath: string

	$: hillPath = `M${STROKE_HALF} ${0.8 - STROKE_HALF} V${0.5} a${0.5 - STROKE_HALF} ${
		0.5 - STROKE_HALF
	} 0 0 1 ${1 - STROKE_WIDTH} 0 v${length - STROKE_HALF}`
	$: hillFillPath = `M0 ${0.8} V${0.5} a${0.5} ${0.5} 0 0 1 1 0 v${0.3}`

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<rect
		x={x * 1.5}
		{y}
		width="4.5"
		height="2"
		fill="#e38f2f40"
		stroke="#e38f2f"
		stroke-width="0.1"
	/>
	<!-- <text x={x * 1.5 + 0.5} y={y + 1.5} fill="#fff" style:font="1.5px sans-serif"
		>{x}:{y}</text
	> -->
	<!-- <svg {x} {y} height={0.8}>
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
		<svg y={0.8}>
			<path fill="#e38f2f" d={hillFillPath} />
			<animate
				attributeName="y"
				dur={DURATION / 2 + 'ms'}
				values={`${0.8};0`}
				calcMode="spline"
				keySplines={'0.54, 0, 0.68, 1'}
				fill="freeze"
			/>
			<animate
				attributeName="y"
				begin={DURATION / 2 + 'ms'}
				dur={DURATION / 3 + 'ms'}
				values={`0;${0.8}`}
				calcMode="spline"
				keySplines={bezierEasing.sineIn}
				fill="freeze"
			/>
		</svg>
	</svg> -->
{/if}
