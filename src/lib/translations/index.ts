import i18n from 'sveltekit-i18n'
import lang from './lang.json'
import type { Config } from 'sveltekit-i18n'
import type { Parser } from '@sveltekit-i18n/parser-default'

export const config: Config = {
	translations: {
		en: { lang },
		fr: { lang },
		nl: { lang },
		es: { lang },
		pt: { lang },
		tr: { lang },
		de: { lang },
		pl: { lang },
	},
	fallbackLocale: 'en',
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
		{
			locale: 'es',
			key: 'main',
			loader: async () => (await import('./es/main.json')).default,
		},
		{
			locale: 'pt',
			key: 'main',
			loader: async () => (await import('./pt/main.json')).default,
		},
		{
			locale: 'tr',
			key: 'main',
			loader: async () => (await import('./tr/main.json')).default,
		},
		{
			locale: 'de',
			key: 'main',
			loader: async () => (await import('./de/main.json')).default,
		},
		{
			locale: 'pl',
			key: 'main',
			loader: async () => (await import('./pl/main.json')).default,
		},
	],
}

export function getNavigatorLanguage(): string {
	if (!navigator || !navigator.language) return 'en'
	if (navigator.language.startsWith('fr')) return 'fr'
	if (navigator.language.startsWith('nl')) return 'nl'
	if (navigator.language.startsWith('es')) return 'es'
	if (navigator.language.startsWith('pt')) return 'pt'
	if (navigator.language.startsWith('tr')) return 'tr'
	if (navigator.language.startsWith('de')) return 'de'
	if (navigator.language.startsWith('pl')) return 'pl'
	return 'en'
}

export const { t, loading, locales, locale, loadTranslations, translations } = new i18n<
	Parser.Params<{ answer?: string }>
>(config)
