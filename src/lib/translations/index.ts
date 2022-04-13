import i18n from 'sveltekit-i18n'
import lang from './lang.json'
import type { Config } from 'sveltekit-i18n'

export const config: Config = {
	translations: {
		en: { lang },
		fr: { lang },
		nl: { lang },
	},
	loaders: [
		{
			locale: 'en',
			key: 'main',
			loader: async () => (await import('./en/main.json')).default,
		},
		{
			locale: 'fr',
			key: 'main',
			loader: async () => (await import('./fr/main.json')).default,
		},
		{
			locale: 'nl',
			key: 'main',
			loader: async () => (await import('./nl/main.json')).default,
		},
	],
}

export function getNavigatorLanguage(): string {
	if (!navigator || !navigator.language) return 'en'
	if (navigator.language.startsWith('fr')) return 'fr'
	if (navigator.language.startsWith('nl')) return 'nl'
	return 'en'
}

export const { t, loading, locales, locale, loadTranslations, translations } = new i18n(config)