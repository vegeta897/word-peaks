import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
	plugins: [sveltekit()],
	server: { port: 3000 },
	resolve: {
		alias: {
			$src: path.resolve('./src'),
			$com: path.resolve('./src/components'),
			$lib: path.resolve('./src/lib'),
		},
	},
	preview: { allowedHosts: ['kolvir.local'] },
})
