<script lang="ts" context="module">
	import { trackPageview } from '$lib/plausible'
	import { locales, loadTranslations, getNavigatorLanguage } from '$lib/translations'
	import { storedLocale } from '$src/store'
	import type { Load } from '@sveltejs/kit'
	import { get } from 'svelte/store'
	import { browser } from '$app/env'
	import '@fontsource-variable/asap'
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
	import { highContrast, dyslexicFont, lastPlayedDaily } from '$src/store'
	import { aprilFools } from '$lib/share'
	$: isAprilFools = $lastPlayedDaily && aprilFools()
</script>

<svelte:head>
	{#if $highContrast}
		<style>
			body {
				--before-color: var(--before-high-contrast-color);
				--correct-color: var(--correct-high-contrast-color);
				--primary-color: var(--primary-high-contrast-color);
				--secondary-color: var(--secondary-high-contrast-color);
				--tertiary-color: var(--tertiary-high-contrast-color);
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
		<title>Word Leaks</title>
	{/if}
</svelte:head>

<div id="main">
	<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />
	<slot />
</div>

<style>
	#main {
		max-width: 720px;
		margin: 0 auto;
	}
</style>
