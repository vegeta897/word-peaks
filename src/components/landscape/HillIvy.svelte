<script lang="ts">
	import { funState } from '$lib/landscape/fun'
	import { sineIn } from 'svelte/easing'
	import { landscapeColor as fullColor } from '$src/store'
	import { bezierEasing } from '$lib/animation'
	import { randomFloat, randomInt } from '$lib/math'

	export let id: number
	export let y: number
	export let size: number
	export let hover: boolean
	export let nudgeX: number
	export let popped: boolean

	const { features } = funState
	$: ivyVines = $features.hill[id] && growIvy($features.hill[id].ivy)

	function growIvy(
		ivy: number[]
	): ({ leaves: number[][]; leftFirst: boolean; speed: number } | false)[] {
		return ivy.slice(0, 3).map((v, i) => {
			if (!v) return false
			return (
				(ivyVines && ivyVines[i]) || {
					leaves: leaves
						.slice(0, randomInt(6, 9))
						.map(() => [randomInt(-16, 6), randomInt(8, 28)]),
					leftFirst: i === 2,
					speed: randomFloat(i === 1 ? 0.8 : 0.6, 1.2), // Middle grows fastest
				}
			)
		})
	}

	const BASE_HALF = 0.6
	const LENGTH = 4.5
	const WIDEN = 1
	const TAPER = 2
	const BASE_CUP = 0.2

	const leafPath = `m0,0 q${-WIDEN},${-TAPER} ${BASE_HALF},${-LENGTH} q${
		BASE_HALF + WIDEN
	},${LENGTH - TAPER} ${BASE_HALF},${LENGTH} q${-BASE_HALF},${-BASE_CUP} ${
		-BASE_HALF * 2
	},0 Z`
	const leaves = [0, 1, 2, 3, 4, 5, 6, 7]
</script>

{#if ivyVines}
	<g clip-path="url(#hill_clip_{id})">
		<g
			style:transform="translateY({hover ? 2 : 0}px) scale({0.85 + size * 0.1})"
			style:transition="transform {hover ? 75 : 200}ms ease-out"
		>
			{#each ivyVines as vine, i}
				{#if vine}
					{#each vine.leaves as leaf, l}
						{@const left = ((vine.leftFirst ? 0 : 1) + l) % 2 === 0}
						{@const yScale = 1 - l / (leaves.length * 4)}
						{@const xScale = left ? -yScale : yScale}
						{@const posScale = 1 - Math.max(0, l - 1) / (leaves.length * 8)}
						<g
							transform="translate({(i - 1) * 10},{(i === 1 ? 7 : 6) -
								l * 2.8 * posScale}) scale({xScale}, {yScale}) rotate(45)"
						>
							<path
								id="hill-ivy-{id}"
								fill="var(--{$fullColor ? 'correct-color' : 'landscape-color'})"
								stroke="var(--{$fullColor ? 'correct-color' : 'landscape-color'})"
								style:transition="fill {$fullColor ? 200 : 1000}ms {y * 20}ms ease, stroke
								{$fullColor ? 200 : 1000}ms {y * 20}ms ease"
								stroke-linejoin="round"
								stroke-width="1"
								d={leafPath}
								style:transform={popped
									? `translate(${leaf[0]}px,-${leaf[1]}px) scale(1.5)`
									: 'none'}
								style:animation-delay="{popped
									? 100 + l * 20
									: 1300 + sineIn(l / (leaves.length - 1)) * 1000 * vine.speed}ms"
								style:animation-duration="{popped
									? leaf[1] * 15
									: 400 + sineIn(l / (leaves.length - 1)) * 200 * vine.speed}ms"
								class:popped
							/>
						</g>
					{/each}
				{/if}
			{/each}
		</g>
		<animateTransform
			attributeName="transform"
			type="skewX"
			begin="hill_nudge_animate_{id}.begin"
			values="0;{nudgeX * 0.5};0"
			keyTimes="0;0.3;1"
			calcMode="spline"
			dur="600ms"
			keySplines="{bezierEasing.cubicOut};{bezierEasing.cubicIn}"
		/>
	</g>
{/if}

<style>
	path {
		animation: grow 500ms cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	@keyframes grow {
		0% {
			transform: scaleY(0);
		}
	}

	.popped {
		animation: scatter 250ms cubic-bezier(0.32, 0, 0.67, 0) reverse both;
	}

	@keyframes scatter {
		0% {
			opacity: 0;
		}
		100% {
			transform: translate(0, 0) scale(1);
		}
	}
</style>
