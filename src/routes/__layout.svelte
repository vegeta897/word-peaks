<script lang="ts">
	import '../app.css'
	import Modal from 'svelte-simple-modal'
	import { SvelteToast } from '@zerodevx/svelte-toast'
</script>

<div id="main">
	<SvelteToast options={{ intro: { y: 0 }, duration: 2000 }} />
	<Modal styleWindow={{ background: 'var(--tertiary-color)', width: '480px' }}><slot /></Modal>
</div>

<footer>
	<p>
		inspired by <a href="https://www.nytimes.com/games/wordle/index.html">Wordle</a><br />
		created by <a href="https://github.com/vegeta897/wordle-peaks">vegeta897</a>
	</p>
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
		align-items: center;
		padding: 4px;
		margin: auto auto 2px;
		opacity: 0.8;
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
