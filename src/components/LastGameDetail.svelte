<script lang="ts">
	import { lastGameDetail } from '$src/store'
	import Time from '$com/Time.svelte'
</script>

<section>
	<h3>Summary</h3>
	<div class="info">
		<div class="info-item">
			<strong
				>{#if $lastGameDetail.mode === 'daily'}
					#{$lastGameDetail.dayNumber}
				{:else}
					∞
				{/if}{#if $lastGameDetail.hardMode}*{/if}</strong
			>
			{#if $lastGameDetail.mode === 'daily'}
				Daily
			{:else}
				Random
			{/if}
		</div>
		<div class="info-item">
			<strong>
				{$lastGameDetail.answer.toUpperCase()}
			</strong>
			Answer
		</div>
		<div class="info-item">
			<strong>
				<Time
					ms={$lastGameDetail.guessTimes[$lastGameDetail.guessTimes.length - 1] -
						$lastGameDetail.guessTimes[0]}
				/>
			</strong>
			Total time
		</div>
	</div>
	<div class="time-stats">
		{#each $lastGameDetail.guesses as guess, g}
			<div class="guess-row">
				<div class="guess-word">
					{#each guess as letter, l}
						<div
							class="guess-letter"
							class:before={letter < $lastGameDetail.answer[l]}
							class:after={letter > $lastGameDetail.answer[l]}
						>
							{letter.toUpperCase()}
						</div>
					{/each}
				</div>
				<div class="time-value">
					<Time ms={$lastGameDetail.guessTimes[g + 1] - $lastGameDetail.guessTimes[g]} />
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	h3 {
		text-align: center;
	}

	section {
		display: flex;
		flex-direction: column;
		align-items: center;
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
		margin-top: 1rem;
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
</style>
