<script lang="ts">
	import Tile from '$lib/Tile.svelte'
	import { t } from '$lib/translations'
	import { screen } from '$lib/store.ts'
	import CloseButton from '$lib/CloseButton.svelte'

	export let newUser: boolean
</script>

<section>
	<CloseButton />
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
	{#if newUser}
		<hr />
		<div class="center">
			<button on:click={() => screen.set('main')}>{$t('main.results.play_daily')}</button>
		</div>
	{/if}
</section>

<style>
	section {
		position: relative;
		padding: 0 1.5rem;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 1.5rem 0;
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

	.center {
		display: flex;
		justify-content: center;
	}

	button {
		background: #04883b;
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-size: 1.2em;
		font-weight: 700;
		min-width: 10rem;
	}

	button:hover {
		background: var(--correct-color);
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	@media (max-width: 480px) {
		section {
			font-size: 0.9em;
		}
	}
</style>
