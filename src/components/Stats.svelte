<script lang="ts">
	import { t } from '$lib/translations'
	import { stats, timeStats } from '$src/store'
	import type { GameMode } from '$lib/data-model'
	import { ROWS } from '$lib/data-model'
	import { get } from 'svelte/store'
	import Time from '$com/Time.svelte'
	import StatBar from '$com/StatBar.svelte'

	export let gameMode: GameMode

	const getHighest = (arr: number[]): number =>
		arr.reduce((a, b) => (b ? Math.max(a, b) : a), 1)
	const highestDistribution = getHighest(get(stats).distribution)
	const { guessTotals, guessCounts } = get(timeStats)
	const highestAvgGuessTime = getHighest(guessTotals.map((t, g) => t / guessCounts[g]))

	const guessCount = guessCounts.reduce((a, b) => a + b, 0)
	const totalTime = guessTotals.reduce((a, b) => a + b, 0)
</script>

<section>
	<div class="stats-container">
		<div class="stats-item">
			<strong>{$stats.totalGames}</strong>
			{$t('main.stats.total_games')}
		</div>
		<div class="stats-item">
			<strong>{Math.round((100 * $stats.wonGames) / ($stats.totalGames || 1))}%</strong>
			{$t('main.stats.win_rate')}
		</div>
		<div class="stats-item">
			<strong>{$stats.currentStreak}</strong>
			{$t('main.stats.current_streak')}
		</div>
		<div class="stats-item">
			<strong>{$stats.bestStreak}</strong>
			{$t('main.stats.best_streak')}
		</div>
	</div>
	<table>
		<tr>
			<th /><th>{$t('main.stats.winning_guesses')}</th>
			<th>{$t('main.stats.average_guess_time')}</th>
		</tr>
		{#each { length: ROWS } as _, g}<tr
				><td>{g + 1}</td><td>
					<StatBar percent={$stats.distribution[g] / highestDistribution}>
						{$stats.distribution[g]}
					</StatBar></td
				><td>
					{#if $timeStats.guessTotals[g] / $timeStats.guessCounts[g]}
						<StatBar
							percent={$timeStats.guessTotals[g] /
								$timeStats.guessCounts[g] /
								highestAvgGuessTime}
							minWidth="2.7em"
						>
							<Time
								ms={$timeStats.guessTotals[g] / $timeStats.guessCounts[g]}
								dimming={false}
							/>
						</StatBar>{/if}</td
				></tr
			>{/each}
	</table>
	{#if $timeStats.gameCount}
		<div class="stats-container" style="margin-top: 1.5rem">
			<div class="stats-item">
				<strong><Time ms={$timeStats.fastestGame} decimals={2} /></strong>
				{$t('main.stats.fastest_game')}
			</div>
			<div class="stats-item">
				<strong><Time ms={totalTime / $timeStats.gameCount} /></strong>
				{$t('main.stats.average_game')}
			</div>
			<div class="stats-item">
				<strong><Time ms={totalTime / guessCount} /></strong>
				{$t('main.stats.average_guess')}
			</div>
		</div>
	{/if}
	{#if gameMode === 'random'}<em>{$t('main.stats.stats_daily')}</em>{/if}
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		padding: 2rem 0.5rem;
	}

	.stats-container {
		display: flex;
		width: 100%;
	}

	.stats-item {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		text-align: center;
		padding: 0 0.2rem;
	}

	.stats-item strong {
		font-size: 1.8em;
	}

	table {
		width: 100%;
		max-width: 26rem;
		margin-top: 1.5rem;
		border-spacing: 0;
		position: relative;
		left: -4px;
	}

	th,
	td {
		padding: 3px 4px;
	}

	th {
		padding-bottom: 8px;
		font-size: 1.1em;
		font-weight: 400;
		text-align: left;
		width: 50%;
	}

	th:nth-child(3) {
		text-align: right;
	}

	th:first-child,
	td:first-child {
		width: 12px;
	}

	td:nth-child(3) {
		display: flex;
		justify-content: flex-end;
	}

	em {
		margin-top: 1rem;
	}

	@media (max-width: 480px) {
		.stats-item {
			font-size: 0.8em;
		}
	}
</style>
