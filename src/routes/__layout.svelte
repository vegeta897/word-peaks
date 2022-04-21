<script lang="ts" context="module">
	import { trackPageview } from '$lib/plausible'
	import { locales, loadTranslations, getNavigatorLanguage } from '$lib/translations'
	import { storedLocale } from '$lib/store'
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
	import Modal from 'svelte-simple-modal'
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { highContrast } from '$lib/store'
</script>

<svelte:head>
	{#if $highContrast}
		<style>
			body {
				--before-color: #da3f8b;
				--before-text-color: #f6dae8;
				--correct-color: #64ba2e;
				--primary-color: #000;
				--secondary-color: #0e1118;
				--tertiary-color: #161a25;
			}
		</style>
	{/if}
</svelte:head>

<div id="main">
	<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />
	<Modal styleWindow={{ background: 'var(--tertiary-color)', width: '500px' }}>
		<slot />
	</Modal>
</div>

<style>
	#main {
		max-width: 528px;
		margin: 0 auto;
	}
</style>
