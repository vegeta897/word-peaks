<script lang="ts" context="module">
	import { trackPageview } from '$lib/plausible'
	import { t, locales, loadTranslations } from '$lib/translations'
	import { storedLocale } from '$lib/store'
	import type { Load } from '@sveltejs/kit'
	import { get } from 'svelte/store'
	export const load: Load = async () => {
		let initialLocale = get(storedLocale)
		if (!locales.get().includes(initialLocale)) initialLocale = 'en'
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

	storedLocale.subscribe((l) => {
		if (locales.get().includes(l)) loadTranslations(l)
	})
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
	<Modal styleWindow={{ background: 'var(--tertiary-color)', width: '480px' }}><slot /></Modal>
</div>

<footer>
	<div class="footer-item important">
		<p>📢 <strong>{$t('main.footer.translate_looking')}</strong></p>
		<p>{@html $t('main.footer.translate_contribute')}</p>
	</div>
	<hr />
	<div class="footer-item">
		{@html $t('main.footer.credits')}
	</div>
	<div class="footer-item icon-row">
		<svg class="icon" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				clip-path="url(#clip0)"
				d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
				fill="#cccccc"
			/>
			<defs>
				<clipPath id="clip0">
					<rect width="71" height="55" fill="#ffffff" />
				</clipPath>
			</defs>
		</svg>
		<pre>vegeta897#7777</pre>
	</div>
	<div class="footer-item icon-row">
		<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 204">
			<path
				fill="#cccccc"
				d="M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04
		C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66
		c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64
		c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76
		c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26
		c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z"
			/>
		</svg>
		<a href="https://twitter.com/vegeta897">@vegeta897</a>
	</div>
</footer>

<style>
	#main {
		max-width: 528px;
		margin: 0 auto;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		margin: 1rem auto 0.2rem;
		max-width: 230px;
	}

	footer p {
		margin: 0 0 0.2rem;
	}

	footer .icon {
		width: 24px;
		height: 24px;
	}

	.footer-item {
		margin: 0.4rem 0 0;
		opacity: 0.8;
	}

	.footer-item.important {
		opacity: 1;
	}

	hr {
		width: 100%;
		opacity: 0.5;
		border-top: 0 solid var(--text-color);
		margin-top: 0.6rem;
	}

	.icon-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	pre {
		font-size: 1.2em;
		background: var(--secondary-color);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		margin: 0;
	}
</style>
