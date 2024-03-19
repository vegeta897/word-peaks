<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	export let delay = 0
	export let tiles: [x: number, y: number][] = []
	let draw = false

	// console.log(10 * Math.sin(0.785))
	// console.log(10 - 10 * Math.cos(0.785))

	// TODO: Blue drops fall from above, falling into pond and turn into expanding circles
	// which then fade out?

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	{#each tiles as [x, y]}
		<rect
			x={x * 1.5}
			{y}
			width="1.5"
			height="1"
			fill="#567de840"
			stroke="#567de8"
			stroke-width="0.1"
		/>
	{/each}
	<!-- <svg {x} {y} viewBox="0 0 70 40" width="35" height="20">
		<path
			stroke="#fff"
			stroke-width="20"
			stroke-linecap="round"
			d="M20,10 h30 M10,20 h50 M30,30 h25"
		/>
		<path
			stroke="#312236"
			stroke-width="12"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M20,20 V10 h30 V20 M10,20 h50 M30,20 V30 h25 V20"
		/>
		<path
			stroke="#ffffff"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M18 15 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 14.14 0 a10 10 0 0 0 7.07 2.93 M34 30 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 7.07 2.93"
		/>
	</svg> -->
{/if}
