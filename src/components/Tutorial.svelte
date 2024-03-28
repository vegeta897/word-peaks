<script lang="ts">
	import Tile from '$com/Tile.svelte'
	import { t } from '$lib/translations'
	import { openScreen, newUser } from '$src/store'
	import Screen from '$com/Screen.svelte'
</script>

<Screen title={$t('main.tutorial.title')}>
	<p>{$t('main.tutorial.objective')}</p>
	<p>{$t('main.tutorial.explanation')}</p>
	<div class="row">
		<div>
			<Tile tile={{ scored: true, letter: 'p', distance: 0, id: 0, polarity: 0 }} />
		</div>
		<p>{$t('main.tutorial.correct_tile')}</p>
	</div>
	<div class="row">
		<div>
			<Tile tile={{ scored: true, letter: 'd', distance: -1, id: 0, polarity: 0 }} />
		</div>
		<p>{$t('main.tutorial.high_tile')}</p>
	</div>
	<div class="row">
		<div>
			<Tile tile={{ scored: true, letter: 'w', distance: 1, id: 0, polarity: 0 }} />
		</div>
		<p>{$t('main.tutorial.low_tile')}</p>
	</div>
	<hr />
	<div class="row">
		<div>
			<Tile
				tile={{
					scored: false,
					letter: '',
					distance: 0,
					id: 0,
					letterBounds: ['e', 'v'],
					polarity: 0,
				}}
				current={true}
				showHint={true}
			/>
		</div>
		<p>{$t('main.tutorial.letter_range')}</p>
	</div>
	{#if $newUser}
		<hr />
		<div class="center">
			<button on:click={() => openScreen.set(null)}>{$t('main.results.play_daily')}</button>
		</div>
	{/if}
</Screen>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0.9rem auto;
	}

	.row p {
		margin: 0;
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
		color: #fff;
		border-radius: 4px;
		border: 0;
		margin-top: 0.8rem;
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
</style>
