<script lang="ts">
	import { currentRow } from '$src/store'
	import { onMount, tick } from 'svelte'
	import { cubicIn } from 'svelte/easing'
	import { fade } from 'svelte/transition'

	export let rowID: number
	export let tileID: number

	let animateElement: SVGAnimateElement
	let dripX: number
	let dripSize: number
	let dripGrowStart: number
	let dripDuration: number

	async function newDrip() {
		dripX = 3 + Math.random() * 4
		dripSize = 0.8 + Math.random() * 0.4
		dripGrowStart = 800 + Math.floor(dripSize * 1000)
		dripDuration = dripGrowStart + 900
		const dripDelay = 100 + Math.floor(Math.random() * 2000)
		await tick()
		animateElement.beginElement()
		dripTimeout = setTimeout(newDrip, dripDelay + dripDuration)
	}

	let dripTimeout: NodeJS.Timer
	onMount(() => {
		dripTimeout = setTimeout(newDrip, 500 + Math.floor(Math.random() * 500))
		return () => clearTimeout(dripTimeout)
	})
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 10 10"
	width="100%"
	height="100%"
	out:fade={{
		delay: $currentRow ? 150 * tileID : 0,
		duration: $currentRow ? 400 : 0,
		easing: cubicIn,
	}}
>
	{#if dripDuration}
		<path fill="var(--after-color)">
			<animate
				id="drip_animate_{rowID}_{tileID}"
				bind:this={animateElement}
				attributeName="d"
				values="M{dripX} {9.8 - dripSize} a 0.1 0.1 0 1 0 0.1 0;M{dripX} {10 -
					dripSize} a {dripSize * 0.9} {dripSize * 0.9} 0 1 0 0.1 0;M{dripX} 16 a {dripSize *
					0.7} {dripSize * 1.6} 0 1 0 0.1 0"
				dur="{dripDuration}ms"
				keyTimes="0;{dripGrowStart / dripDuration};1"
				calcMode="spline"
				keySplines="0.34 1 0.64 1;1 0 0.9 0"
				fill="freeze"
				begin="indefinite"
			/>
			<animate
				attributeName="opacity"
				values="1;1;0"
				dur="{dripDuration}ms"
				keyTimes="0;{1 - 200 / dripDuration};1"
				calcMode="spline"
				keySplines="0 0 0 0;0.32 0 0.67 0"
				fill="freeze"
				begin="drip_animate_{rowID}_{tileID}.begin"
			/>
		</path>
	{/if}
</svg>

<style>
	svg {
		position: relative;
		z-index: 999;
		overflow: visible;
		pointer-events: none;
	}
</style>
