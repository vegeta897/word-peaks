<script lang="ts">
	import '../app.css'
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { highContrast, dyslexicFont, answer } from '$src/store'
	import { aprilFools } from '$lib/share'
	import { tileArrowRadius } from '$src/store'

	$: isAprilFools = $answer && aprilFools()
</script>

<svelte:head>
	{#if $highContrast}
		<style>
			body {
				--before-color: #da3f8b;
				--correct-color: #64ba2e;
				--primary-color: #000;
				--secondary-color: #0e1118;
				--tertiary-color: #161a25;
			}
		</style>
	{/if}
	{#if $dyslexicFont}
		<style>
			@font-face {
				font-family: 'OpenDyslexic-Regular';
				src: url('font/OpenDyslexic-Regular.woff') format('woff');
			}
			body {
				font-family: OpenDyslexic-Regular, var(--font-list);
				font-size: 0.9em;
			}
		</style>
	{/if}
	{#if isAprilFools}
		<title>Worm Peaks</title>
	{/if}
</svelte:head>

<div id="main" style="--tile-arrow-radius: {$tileArrowRadius}">
	<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />
	<slot />
</div>

<style>
	#main {
		max-width: 720px;
		margin: 0 auto;
	}
</style>
