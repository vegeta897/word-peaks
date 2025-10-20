<script lang="ts" context="module">
	import { randomChance, randomElement, randomFloat, randomInt, type XY } from '$lib/math'
	import { onMount } from 'svelte'
	import { cubicIn } from 'svelte/easing'

	type Sparkle = {
		xy: XY
		stroke: string
		fill: string
		size: number
		delay: number
	}
	const sparkleColors = ['#ffffff', '#ffbfe4', '#ed98cb']
	const sparkleAnimation = [
		{ opacity: 0, transform: 'translateY(-1px)', easing: 'ease-out' },
		{ opacity: 1, easing: 'ease-in' },
		{ opacity: 0, transform: 'translateY(1px)' },
	]
</script>

<script lang="ts">
	export let count: number
	export let x = 0
	export let y = 0
	export let disperseX: number
	export let disperseY: number

	const createSparkle = (): Sparkle => {
		const xDistance = cubicIn(randomFloat(0.3, 1)) * disperseX
		const size = randomInt(60, 120) / 100 - xDistance / 100 // Diminishes with x distance
		const color = randomElement(sparkleColors)
		return {
			xy: [
				x + xDistance * (randomChance() ? -1 : 1),
				y + randomInt(-disperseY, disperseY),
			],
			size,
			stroke: size < 1 ? 'none' : color,
			fill: size >= 1 ? 'none' : color,
			delay: randomInt(0, count * 50),
		}
	}

	const sparkles: Sparkle[] = new Array(count).fill(0).map(createSparkle)
	const sparkleElements: SVGGElement[] = []

	async function animateSparkle(sparkleIndex: number) {
		const sparkle = sparkles[sparkleIndex]
		if (!sparkle) return
		const element = sparkleElements[sparkleIndex]
		if (!element) return
		await element.animate(sparkleAnimation, {
			delay: sparkle.delay,
			duration: randomInt(350, 800),
			fill: 'forwards',
		}).finished
		// sparkles[sparkleIndex] = createSparkle() // Re-generate sparkle
		// animateSparkle(sparkleIndex)
	}

	onMount(() => {
		sparkles.forEach((_, i) => animateSparkle(i))
	})
</script>

{#each sparkles as { xy: [x, y], size, stroke, fill }, s (s)}
	<g bind:this={sparkleElements[s]} opacity="0">
		<path
			transform="translate({x},{y}) scale({size})"
			d="M0,-1.5 L1,0 L0,1.5 L-1,0 Z"
			{stroke}
			{fill}
			stroke-width="0.5"
			stroke-linejoin="round"
		/>
	</g>
{/each}
