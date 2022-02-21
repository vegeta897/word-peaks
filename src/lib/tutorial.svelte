<script lang="ts">
	import Tile from '$lib/tile.svelte'
</script>

<section>
	<h2>How to play</h2>
	<p>Guess the word in 6 tries!</p>
	<p>
		After each guess, the tiles show whether your letters occur higher or lower in the alphabet
		compared to the correct letters.
	</p>
	<div>
		<div><Tile tile={{ scored: true, letter: 'w', distance: 0, id: 0 }} /></div>
		<p>Letter is correct</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'p', distance: -1, id: 0 }} /></div>
		<p>Letter is too high in the alphabet</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'v', distance: 1, id: 0 }} /></div>
		<p>Letter is too low in the alphabet</p>
	</div>
	<img alt="Help" src="keyboard.png" />
	<p>The keyboard shows you the range of possible letters for each tile as you type.</p>
</section>

<style>
	section {
		padding: 0 0.8rem;
	}

	h2 {
		font-size: 1.5em;
	}

	section > div p {
		margin: 0;
	}

	section > div {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0.9rem auto;
		max-width: 340px;
	}

	img {
		display: block;
		max-width: 80%;
		margin: 1rem auto 0;
	}

	@media (max-width: 480px) {
		section {
			font-size: 0.9em;
		}
	}
</style>
