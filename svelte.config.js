import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'
import path from 'path'

const dev = process.env.NODE_ENV === 'development'
const netlify = process.env.NETLIFY_BUILD

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		vite: {
			resolve: {
				alias: {
					$src: path.resolve('./src'),
				},
			},
		},
		paths: {
			base: dev || netlify ? '' : '/wordle-peaks',
		},
	},
}

export default config
