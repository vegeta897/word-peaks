<script lang="ts">
	import Tile from '$lib/tile.svelte'
</script>

<section>
	<h2>How to play</h2>
	<p>Guess the word in 6 tries!</p>
	<p>
		After each guess, the color of the tiles will change to show how close your guess was to the
		word.
	</p>
	<p />
	<div>
		<div><Tile tile={{ scored: true, letter: 'w', distance: 0, id: 0 }} /></div>
		<p>This tile has the correct letter</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'p', distance: -1, id: 0 }} /></div>
		<p>This tile has a letter that is too high for this spot</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'v', distance: 1, id: 0 }} /></div>
		<p>This tile has a letter that is too low for this spot</p>
	</div>
	<img alt="Help" src="keyboard.png" />
	<p>The keyboard will show you the possible letters for each spot as you type!</p>
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
		margin: 0.9rem 0;
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
