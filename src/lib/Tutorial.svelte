<script lang="ts">
	import Tile from '$lib/Tile.svelte'
	import { t } from '$lib/translations'
</script>

<section>
	<h2>{$t('main.tutorial.title')}</h2>
	<p>{$t('main.tutorial.objective')}</p>
	<p>{$t('main.tutorial.explanation')}</p>
	<div>
		<div><Tile tile={{ scored: true, letter: 'p', distance: 0, id: 0 }} /></div>
		<p>{$t('main.tutorial.correct_tile')}</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'd', distance: -1, id: 0 }} /></div>
		<p>{$t('main.tutorial.high_tile')}</p>
	</div>
	<div>
		<div><Tile tile={{ scored: true, letter: 'w', distance: 1, id: 0 }} /></div>
		<p>{$t('main.tutorial.low_tile')}</p>
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
		<p>{$t('main.tutorial.letter_range')}</p>
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
