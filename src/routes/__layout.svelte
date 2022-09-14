<script lang="ts" context="module">
	import { trackPageview } from '$lib/plausible'
	import { locales, loadTranslations, getNavigatorLanguage } from '$lib/translations'
	import { storedLocale } from '$src/store'
	import type { Load } from '@sveltejs/kit'
	import { get } from 'svelte/store'
	import { browser } from '$app/env'
	export const load: Load = async () => {
		if (!browser) {
			await loadTranslations('en')
			return {}
		}
		let initialLocale = get(storedLocale)
		if (!initialLocale) initialLocale = getNavigatorLanguage()
		if (!locales.get().includes(initialLocale)) initialLocale = 'en'
		storedLocale.set(initialLocale)
		await loadTranslations(initialLocale)
		return {}
	}
	trackPageview()
</script>

<script lang="ts">
	import '../app.css'
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { highContrast, dyslexicFont } from '$src/store'
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
</svelte:head>

<div id="main">
	<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />
	<slot />
</div>

<style>
	#main {
		max-width: 558px;
		margin: 0 auto;
	}
</style>
