import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const dev = process.env.NODE_ENV === 'development'
const netlify = process.env.NETLIFY_BUILD

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), preprocess()],

	kit: {
		adapter: adapter(),
		paths: {
			base: dev || netlify ? '' : '/word-peaks',
		},
		alias: {
			$src: 'src',
			'$src/*': 'src/*',
			$lib: 'src/lib',
			'$lib/*': 'src/lib/*',
			$com: 'src/components',
			'$com/*': 'src/components/*',
		},
	},
}

export default config
