import i18n from 'sveltekit-i18n'
import lang from './lang.json'
import type { Config } from 'sveltekit-i18n'

export const config: Config = {
	translations: {
		en: { lang },
	},
	loaders: [
		{
			locale: 'en',
			key: 'main',
			loader: async () => (await import('./en/main.json')).default,
		},
	],
}

export const { t, loading, locales, locale, loadTranslations } = new i18n(config)
loading.subscribe(($loading) => $loading && console.log('Loading translations...'))
