<script lang="ts">
	import { t } from '$lib/translations'
	import Time from '$com/Time.svelte'
	import type { GameDetail } from '$lib/stats'

	export let lastGameDetail: GameDetail | null
</script>

<section>
	<div class="info">
		<div class="info-item">
			<strong
				>{`${lastGameDetail.mode === 'daily' ? '#' + lastGameDetail.dayNumber : '∞'}${
					lastGameDetail.hardMode ? '*' : ''
				}`}</strong
			>
			{#if lastGameDetail.mode === 'daily'}
				{$t('main.summary.daily')}
			{:else}
				{$t('main.summary.random')}
			{/if}
		</div>
		<div class="info-item">
			<strong style="letter-spacing: 0.2rem">
				{lastGameDetail.answer.toUpperCase()}
			</strong>
			{$t('main.summary.answer')}
		</div>
		<div class="info-item">
			<strong>
				<Time
					ms={lastGameDetail.guessTimes[lastGameDetail.guessTimes.length - 1] -
						lastGameDetail.guessTimes[0]}
				/>
			</strong>
			{$t('main.summary.total_time')}
		</div>
	</div>
	<div class="time-stats">
		{#each lastGameDetail.guesses as guess, g}
			<div class="guess-row">
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
				<div class="time-value">
					<Time ms={lastGameDetail.guessTimes[g + 1] - lastGameDetail.guessTimes[g]} />
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2em 0;
	}

	.info {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.info-item {
		width: calc(100% / 3);
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

	.time-stats {
		margin: 1.4rem 0.4rem 0;
		text-align: right;
		display: flex;
		flex-direction: column;
	}

	.guess-row {
		padding: 2px 0;
		display: flex;
		font-size: 1.5em;
	}

	.guess-word {
		display: flex;
		width: 190px;
	}

	.guess-letter {
		width: 30px;
		height: 30px;
		margin-right: 4px;
		font-weight: 700;
		color: #fff;
		text-shadow: 1px 1px 1px #0003;
		border: 2px solid var(--correct-color);
		border-radius: 2px;
		box-sizing: border-box;
		background: var(--correct-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.guess-letter.before {
		background: var(--before-color);
		border-color: var(--before-color);
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}
	.guess-letter.after {
		background: var(--after-color);
		border-color: var(--after-color);
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	.time-value {
		width: 96px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	@media (max-width: 360px) {
		.info-item {
			font-size: 0.9em;
		}
		.guess-word {
			width: 170px;
		}
		.guess-letter {
			width: 28px;
			height: 28px;
		}
		.time-value {
			width: 64px;
			font-size: 0.8em;
		}
	}
</style>
