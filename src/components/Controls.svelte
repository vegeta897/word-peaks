<script lang="ts">
	import { showEndView, gameMode } from '$src/store'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import EndButtons from './EndButtons.svelte'
	import Keyboard from './Keyboard.svelte'
	import { onMount, tick } from 'svelte'

	let transitionDuration = 0
	onMount(async () => {
		await tick()
		transitionDuration = 250
	})
</script>

<section>
	{#if $showEndView}
		<div transition:fade={{ duration: transitionDuration, easing: cubicOut }}>
			<EndButtons gameMode={$gameMode} />
		</div>
	{:else}
		<div transition:fade={{ duration: transitionDuration, easing: cubicOut }}>
			<Keyboard />
		</div>
	{/if}
</section>

<style>
	section {
		height: 186px;
		position: relative;
	}

	section div {
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	@media (min-width: 721px) and (max-height: 730px) {
		section {
			height: 168px;
		}
	}
	@media (min-width: 721px) and (max-height: 710px) {
		section {
			height: 156px;
		}
	}
	@media (min-width: 721px) and (max-height: 695px) {
		section {
			height: 150px;
		}
	}
</style>
