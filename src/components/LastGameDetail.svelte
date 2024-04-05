<script lang="ts">
	import { t } from '$lib/translations'
	import Time from '$com/Time.svelte'
	import type { GameDetail } from '$lib/stats'
	import * as store from '$src/store'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	const { preciseTimes } = store

	export let lastGameDetail: GameDetail

	let totalTimeString: string
	let guessTimeStrings: string[] = []

	$: store.totalGuessTimeString.set(totalTimeString)
	$: store.guessTimeStrings.set(guessTimeStrings)
	$: gameWon =
		lastGameDetail.guesses[lastGameDetail.guesses.length - 1] === lastGameDetail.answer
</script>

<section transition:fade|local={{ duration: 250, easing: cubicOut }}>
	<table class="guess-table">
		{#each lastGameDetail.guesses as guess, g}
			<tr class="guess-row">
				<td class="guess-column">
					<div class="guess-word">
						{#each guess as letter, l}
							<div
								class="guess-letter"
								class:before={letter < lastGameDetail.answer[l]}
								class:after={letter > lastGameDetail.answer[l]}
							>
								{letter.toUpperCase()}
							</div>
						{/each}
					</div>
				</td>
				<td class="time-value">
					<Time
						bind:timeString={guessTimeStrings[g]}
						ms={lastGameDetail.guessTimes[g + 1] - lastGameDetail.guessTimes[g]}
						decimals={$preciseTimes ? 2 : 0}
					/>
				</td>
			</tr>
		{/each}
	</table>
	<h2>
		{gameWon ? `${$t('main.results.win')} 🎉` : `${$t('main.results.lose')} ☹️`}
	</h2>
	<div class="info">
		<div class="info-item">
			<strong style="letter-spacing: 0.2rem">
				{lastGameDetail.answer.toUpperCase()}
			</strong>
			{$t('main.summary.answer')}
		</div>
		<div class="info-item">
			<strong>
				<Time
					bind:timeString={totalTimeString}
					ms={lastGameDetail.guessTimes[lastGameDetail.guessTimes.length - 1] -
						lastGameDetail.guessTimes[0]}
					decimals={$preciseTimes ? 2 : 0}
				/>
			</strong>
			{$t('main.summary.total_time')}
			{#if lastGameDetail.fastest}
				<div class="new-tag">{$t('main.messages.new_best')}</div>
			{/if}
		</div>
	</div>
</section>

<style>
	section {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.guess-table {
		border-spacing: 0;
	}

	.guess-table td {
		padding: 0;
	}

	.guess-word {
		display: flex;
	}

	.guess-letter {
		width: 30px;
		height: 30px;
		margin: 0 0.25rem 0.25rem 0;
		font-size: 1.5em;
		font-weight: 700;
		color: #fff;
		text-shadow: 1px 1px 1px #0003;
		border: 2px solid var(--correct-color);
		border-radius: 14%;
		box-sizing: border-box;
		background: var(--correct-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.guess-letter.before {
		background: var(--before-color);
		border-color: var(--before-color);
		border-top-left-radius: 35%;
		border-top-right-radius: 35%;
	}
	.guess-letter.after {
		background: var(--after-color);
		border-color: var(--after-color);
		border-bottom-left-radius: 35%;
		border-bottom-right-radius: 35%;
	}

	.guess-table .time-value {
		padding-left: 1rem;
		font-size: 1.5em;
		text-align: right;
	}

	h2 {
		font-size: 1.5em;
		margin: 0.5rem 0 0.75rem;
	}

	.info {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.info-item {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		text-align: center;
		font-size: 1.2em;
	}

	.info-item strong {
		font-size: 1.6em;
	}

	.new-tag {
		background: var(--accent-color);
		border-radius: 6px;
		padding: 2px 5px;
		font-weight: 700;
		font-size: 0.8em;
		margin-top: 2px;
	}

	@media (max-width: 560px) {
		.info-item {
			font-size: 1em;
		}
		.guess-letter {
			width: 28px;
			height: 28px;
			font-size: 1.3em;
		}
		.time-value {
			font-size: 1.1em;
		}
	}

	@media (max-width: 480px) {
		section {
			padding: 0;
		}
		.guess-letter {
			width: 24px;
			height: 24px;
			font-size: 1.2em;
			margin: 0 0.1875rem 0.1875rem 0;
		}
		.guess-table .time-value {
			padding-left: 0.5rem;
			font-size: 1em;
		}
		.info-item {
			font-size: 0.9em;
		}
	}

	@media (max-width: 360px) {
		h2 {
			font-size: 1.25em;
			margin: 0.25rem 0 0.5rem;
		}
		.info-item {
			font-size: 0.8em;
		}
	}
</style>
