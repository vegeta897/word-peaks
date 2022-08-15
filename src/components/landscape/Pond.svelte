<script lang="ts">
	import { onMount } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	export let x = 0
	export let y = 0
	export let delay = 0
	let draw = false

	// console.log(10 * Math.sin(0.785))
	// console.log(10 - 10 * Math.cos(0.785))

	onMount(() => {
		setTimeout(() => (draw = true), delay)
	})
</script>

{#if draw}
	<svg {x} {y}>
		<!-- Use path data for pond outline -->
		<rect x="10" y="0" rx="10" ry="10" width="45" height="20" fill="#ffffff" />
		<rect x="0" y="10" rx="10" ry="10" width="70" height="20" fill="#ffffff" />
		<rect x="20" y="20" rx="10" ry="10" width="42" height="20" fill="#ffffff" />
		<rect x="12" y="2" rx="8" ry="8" width="41" height="20" fill="#312236" />
		<rect x="2" y="12" rx="8" ry="8" width="66" height="16" fill="#312236" />
		<rect x="22" y="18" rx="8" ry="8" width="38" height="20" fill="#312236" />
		<!--		<path-->
		<!--			stroke="#567de8"-->
		<!--			stroke-width="20"-->
		<!--			stroke-linecap="round"-->
		<!--			d="M20 10 h25 M10 20 h50 M30 30 h22"-->
		<!--		/>-->
		<path
			stroke="#ffffff"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M18 15 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 14.14 0 a10 10 0 0 0 7.07 2.93 M34 30 a10 10 0 0 0 7.07 -2.93 a10 10 0 0 0 7.07 2.93"
		/>
		<!-- Bezier curve method? -->
		<!--		<path-->
		<!--			stroke="#ffffff"-->
		<!--			stroke-width="2"-->
		<!--			fill="none"-->
		<!--			stroke-linecap="round"-->
		<!--			stroke-linejoin="round"-->
		<!--			d="M18 25 c0 0 4 0 8 -4 c4 5 10 5 14 0 c4 4 8 4 8 4"-->
		<!--		/>-->
	</svg>
{/if}
