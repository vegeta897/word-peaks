<script lang="ts">
	import '../app.css'
</script>

<main>
	<slot />
</main>

<footer>
	<p>
		inspired by <a href="https://www.nytimes.com/games/wordle/index.html">Wordle</a><br />
		created with <a href="https://kit.svelte.dev">SvelteKit</a>
	</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
