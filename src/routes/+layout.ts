import { locales, loadTranslations, getNavigatorLanguage } from '$lib/translations'
import { browser } from '$app/environment'
import { get } from 'svelte/store'
import { storedLocale } from '$src/store'
import { trackPageview } from '$lib/plausible'

export const load = async ({ url }) => {
	if (!browser) {
		await loadTranslations('en')
		return {}
	}
	trackPageview()
	let initialLocale = get(storedLocale)
	if (!initialLocale) initialLocale = getNavigatorLanguage()
	if (!locales.get().includes(initialLocale)) initialLocale = 'en'
	storedLocale.set(initialLocale)

	await loadTranslations(initialLocale, url.pathname)

	return {}
}

export const prerender = true
