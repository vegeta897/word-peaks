<script lang="ts">
	import { onMount } from 'svelte'

	const EASE_IN_CUBIC = '0.32, 0, 0.67, 0;'
	const EASE_IN_OUT_CUBIC = '0.65, 0, 0.35, 1;'
	const EASE_IN_SINE = '0.12, 0, 0.39, 0;'
	const EASE_IN_OUT_SINE = '0.37, 0, 0.63, 1;'
	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 3
	const DURATION = 700

	const hillPath = `M1 49 V25 a24 24 0 0 1 48 0 v24`

	export let x = 0
	export let y = 0
	export let size = 50
	export let delay = 0
	let draw = false

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<svg {x} {y} width={size} height={size} viewBox="0 0 50 50">
		<defs>
			<clipPath id="hill-clip">
				<path d={hillPath} />
			</clipPath>
		</defs>
		<svg clip-path="url(#hill-clip)">
			<path
				opacity="0"
				stroke="#ffffff"
				stroke-linecap="round"
				stroke-width={STROKE_WIDTH}
				fill="#312236"
				d={hillPath}
				vector-effect="non-scaling-stroke"
			>
				<animate
					attributeName="opacity"
					values="0;0;1;1"
					dur={DURATION + 'ms'}
					keyTimes="0;0.5;0.5;1"
					fill="freeze"
				/>
			</path>
			<svg y="50" height="50">
				<path
					stroke="#e38f2f"
					stroke-linecap="round"
					stroke-width={STROKE_WIDTH}
					fill="#e38f2f"
					d={hillPath}
					vector-effect="non-scaling-stroke"
				/>
				<animate
					attributeName="y"
					dur={DURATION / 2 + 'ms'}
					values="50;0"
					calcMode="spline"
					keySplines={'0.54, 0, 0.68, 1;'}
				/>
				<animate
					attributeName="y"
					begin={DURATION / 2 + 'ms'}
					dur={DURATION / 3 + 'ms'}
					values="0;50"
					calcMode="spline"
					keySplines={EASE_IN_SINE}
				/>
			</svg>
		</svg>
	</svg>
{/if}
