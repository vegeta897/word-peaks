<script lang="ts">
	import { t } from '$lib/translations'
	import Time from '$com/Time.svelte'
	import type { GameDetail } from '$lib/stats'
	import * as store from '$src/store'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { aprilFools } from '$src/lib/share'

	const { preciseTimes, lastPlayedDaily } = store

	export let lastGameDetail: GameDetail

	let totalTimeString: string
	let guessTimeStrings: string[] = []

	$: store.totalGuessTimeString.set(totalTimeString)
	$: store.guessTimeStrings.set(guessTimeStrings)
	$: gameWon =
		lastGameDetail.guesses[lastGameDetail.guesses.length - 1] === lastGameDetail.answer

	$: isAprilFools = $lastPlayedDaily && aprilFools()
	function hopPea(element: HTMLElement) {
		element.animate(
			[
				{ transform: 'translateY(0)', easing: 'ease-out' },
				{ transform: 'translateY(-8px)', easing: 'ease-in' },
				{ transform: 'translateY(0)' },
			],
			{ duration: 200 }
		)
	}
</script>

<section transition:fade={{ duration: 250, easing: cubicOut }}>
	<table class="guess-table">
		{#each lastGameDetail.guesses as guess, g}
			{@const peaRow = isAprilFools && g === lastGameDetail.guesses.length - 1}
			<tr class="guess-row">
				<td class="guess-column">
					<div class="guess-word">
						{#each guess as letter, l}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="guess-letter"
								class:before={letter < lastGameDetail.answer[l]}
								class:after={letter > lastGameDetail.answer[l]}
								class:pea={isAprilFools && letter === lastGameDetail.answer[l]}
								on:click={(e) => peaRow && hopPea(e.currentTarget)}
								role="button"
								tabindex={l}
							>
								{letter.toUpperCase()}
							</div>
						{/each}
					</div>
					{#if peaRow}
						<svg class="pea-pod" viewBox="0 0 205 43">
							<path
								d="M204.555,24.196c-5.846,13.124 -16.618,15.198 -25.006,16.13c-7.791,0.866 -14.524,-0.466 -21.448,-0.311c-4.949,0.11 -11.226,1.135 -16.184,1.55c-8.177,0.684 -11.986,-0.584 -17.466,-0.496c-5.557,0.089 -9.139,1.502 -14.678,1.62c-8.597,0.184 -11.504,-2.027 -19.038,-1.967c-8.376,0.066 -10.955,1.167 -17.78,1.05c-5.494,-0.094 -14.16,-1.088 -17.551,-1.155c-7.434,-0.146 -11.777,1.093 -19.236,0.253c-11.178,-1.259 -27.431,-12.837 -29.574,-33.862c12.886,10.704 21.567,25.417 49.377,24.238c25.708,-1.091 65.566,0.338 91.802,0.43c28.889,0.101 42.417,-0.158 56.782,-7.48Z"
								style="fill:#5ec52c;"
							/>
							<path
								d="M9.14,4.704c-1.889,-2.362 -1.373,-7.053 -6.175,-3.297c-5.915,4.627 -1.473,4.433 0.438,6.835c-1.257,2.344 -2.984,4.98 -0.038,8.781c2.682,3.461 2.846,4.911 4.017,10.578c3.342,-6.453 1.562,-13.873 1.562,-13.873c-0,0 5.317,3.292 8.983,7.534c-1.19,-6.622 -4.661,-10.455 -4.661,-10.455c-0,-0 7.536,0.757 12.228,-0.989c-11.769,-1.187 -10.295,-9.002 -16.354,-5.114Z"
								style="fill:#15a850;"
							/>
						</svg>
					{/if}
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
		position: relative;
	}

	.guess-word {
		display: flex;
	}

	.pea-pod {
		width: 205px;
		position: absolute;
		left: -16px;
		top: -4px;
		pointer-events: none;
	}

	.guess-letter {
		width: 34px;
		height: 34px;
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
		position: relative;
	}
	.guess-letter.before {
		background: var(--before-color);
		border-color: var(--before-color);
		border-top-left-radius: var(--tile-arrow-radius);
		border-top-right-radius: var(--tile-arrow-radius);
	}
	.guess-letter.after {
		background: var(--after-color);
		border-color: var(--after-color);
		border-bottom-left-radius: var(--tile-arrow-radius);
		border-bottom-right-radius: var(--tile-arrow-radius);
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

	.guess-letter.pea {
		border-radius: 100%;
	}

	@media (max-width: 720px) {
		.guess-letter {
			width: 30px;
			height: 30px;
			font-size: 1.5em;
		}
		.pea-pod {
			width: 190px;
			left: -20px;
			top: -4px;
		}
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
		.pea-pod {
			width: 180px;
			left: -20px;
			top: -5px;
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
		.pea-pod {
			width: 150px;
			left: -14px;
			top: -4px;
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
		.pea-pod {
			width: 150px;
			left: -14px;
			top: -3px;
		}
	}
</style>
