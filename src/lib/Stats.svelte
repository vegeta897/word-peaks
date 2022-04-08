<script lang="ts">
	import { t } from '$lib/translations'
	import type { GameMode, Stats } from '$lib/data-model'

	export let stats: Stats
	export let gameMode: GameMode
	const highestDistribution = stats.distribution.reduce((a, b) => Math.max(a, b), 1)
</script>

<div class="stats">
	<div class="stats-item">
		<strong>{stats.totalGames}</strong>
		{$t('main.stats.total_games')}
	</div>
	<div class="stats-item">
		<strong>{Math.round((100 * stats.wonGames) / (stats.totalGames || 1))}%</strong>
		{$t('main.stats.win_rate')}
	</div>
	<div class="stats-item">
		<strong>{stats.currentStreak}</strong>
		{$t('main.stats.current_streak')}
	</div>
	<div class="stats-item">
		<strong>{stats.bestStreak}</strong>
		{$t('main.stats.best_streak')}
	</div>
	<div class="distribution">
		<h3>{$t('main.stats.guess_distribution')}</h3>
		{#each stats.distribution as guessCount, c}
			<div class="bar-row">
				{c + 1}
				<div
					class="bar"
					style={`width: calc(22px + ${Math.round((100 * guessCount) / highestDistribution)}%)`}
				>
					{guessCount}
				</div>
			</div>
		{/each}
	</div>
	{#if gameMode === 'random'}<em>{$t('main.stats.stats_daily')}</em>{/if}
</div>

<style>
	.stats {
		color: var(--text-color);
		display: flex;
		justify-content: center;
		margin-bottom: 1.4rem;
		flex-wrap: wrap;
	}

	.stats-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		text-align: center;
	}

	.stats-item strong {
		font-size: 1.8em;
	}

	h3 {
		margin: 0.5rem 0;
		text-align: center;
	}

	.distribution {
		margin-top: 1rem;
		max-width: 20rem;
		flex-basis: 100%;
	}

	.bar-row {
		display: flex;
		align-items: baseline;
	}

	.bar {
		height: 20px;
		background-color: var(--accent-color);
		border-radius: 8px;
		margin-bottom: 6px;
		font-weight: 700;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 8px;
	}
	@media (max-width: 480px) {
		.stats-item {
			font-size: 0.8em;
		}
	}
</style>
