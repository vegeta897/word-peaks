<script lang="ts">
	import Tile from '$lib/Tile.svelte'
</script>

<section>
	<h2>How to play</h2>
	<p>Guess the word in 6 tries!</p>
	<p>
		After each guess, the tiles show whether your letters occur higher or lower in the alphabet
		compared to the correct letters.
	</p>
	<div>
		<div><Tile tile={{ scored: true, letter: 'p', distance: 0, id: 0 }} /></div>
		<p>Letter is correct</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'd', distance: -1, id: 0 }} /></div>
		<p>Letter is too high in the alphabet</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'w', distance: 1, id: 0 }} /></div>
		<p>Letter is too low in the alphabet</p>
	</div>
	<hr />
	<div>
		<div>
			<Tile
				tile={{ scored: false, letter: '', distance: 0, id: 0, letterBounds: ['e', 'v'] }}
				current={true}
				showHint={true}
			/>
		</div>
		<p>The range of possible letters is shown on the tile and the keyboard as you type</p>
	</div>
</section>

<style>
	section {
		padding: 0 0.8rem;
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
		margin: 0.6rem 0 1rem;
	}

	section > div p {
		margin: 0;
	}

	section > div {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0.9rem auto;
	}

	hr {
		max-width: 63%;
		border: 1px solid #666;
	}

	@media (max-width: 480px) {
		section {
			font-size: 0.9em;
		}
	}
</style>
