<script lang="ts">
	import '../app.css'
	import Modal from 'svelte-simple-modal'
	import { SvelteToast } from '@zerodevx/svelte-toast'
</script>

<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />

<div id="main">
	<Modal styleWindow={{ background: 'var(--tertiary-color)', width: '480px' }}><slot /></Modal>
</div>

<footer>
	<p>
		inspired by <a href="https://www.nytimes.com/games/wordle/index.html">Wordle</a><br />
		created with <a href="https://kit.svelte.dev">SvelteKit</a>
	</p>
</footer>

<style>
	#main {
		max-width: 80rem;
		margin: 0 auto;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 4px;
		margin: auto auto 2px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 4px 0;
		}
	}
</style>
