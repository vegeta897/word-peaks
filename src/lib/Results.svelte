<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'
	import { trackEvent } from '$lib/plausible'
	import { encodeWord, getDayEnd } from '$lib/data-model'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer
	export let guesses
	export let gameMode
	export let gameWon
	export let dayNumber
	export let playDaily
	export let playRandom

	let nextMS
	const updateNextMS = () => (nextMS = getDayEnd(dayNumber) - new Date())
	updateNextMS()

	setInterval(() => {
		updateNextMS()
	}, 1000)

	$: nextWordReady = nextMS < 0

	const HOUR = 3600000
	const MINUTE = 60000

	const score = gameWon ? guesses.length : 'X'
	const emojis = guesses
		.map((word) =>
			[...word]
				.map((letter, l) => {
					if (letter === answer[l]) return '🟩'
					return letter > answer[l] ? '🔽' : '🔼'
				})
				.join('')
		)
		.join('\n  ')
	let day = gameMode === 'random' ? '∞ ' : `#${dayNumber} `
	let shareText = `Wordle Peaks ${day}${score}/6\n\n  ${emojis}`
	if (gameMode === 'random')
		shareText += `\nhttps://vegeta897.github.io/wordle-peaks/#${encodeWord(answer)}`

	function share() {
		trackEvent('resultShare')
		toast.pop()
		navigator.clipboard.writeText(shareText).then(
			() =>
				toast.push('Score copied!', {
					theme: { '--toastBackground': 'var(--cta-color)' },
				}),
			() =>
				toast.push("Sorry, couldn't do that!", {
					theme: { '--toastBackground': 'var(--error-color)' },
				})
		)
	}
</script>

<section>
	<h2>Results</h2>
	{#if gameWon}
		<h3>You won 🎉</h3>
		<p>Nice job!</p>
	{:else}
		<h3>You lost ☹️</h3>
		<p>The answer was <strong>{answer.toUpperCase()}</strong></p>
	{/if}
	<div class="share">
		<div class="column">
			{#if nextWordReady}
				<div class="daily-text">Try today's word!</div>
				<button on:click={playDaily} class="daily-button">Play Daily</button>
			{:else}
				<div class="countdown">
					<h4>Next word</h4>
					<strong
						>{`${Math.floor(nextMS / HOUR)}`.padStart(2, '0')}:{`${Math.floor(
							(nextMS % HOUR) / MINUTE
						)}`.padStart(2, '0')}:{`${Math.floor((nextMS % MINUTE) / 1000)}`.padStart(
							2,
							'0'
						)}</strong
					>
				</div>
			{/if}
		</div>
		<div class="column">
			<button on:click={share} class="share-button">Share</button>
			<button on:click={playRandom}>Play Random</button>
		</div>
	</div>
</section>

<style>
	section {
		padding: 0 1rem 1rem;
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
	}

	h3 {
		font-size: 1.2em;
	}

	h4 {
		width: 6rem;
		margin: 0.5rem 0;
	}

	.share {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		color: var(--text-color);
	}

	pre {
		white-space: pre-wrap;
		font-size: 1.2em;
		margin: 0;
		padding: 1rem;
		min-width: 12rem;
		color: var(--text-color);
		background: var(--secondary-color);
		border-radius: 8px;
	}

	.column {
		display: flex;
		justify-content: space-around;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	pre,
	.column {
		flex: 1 1 0;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-size: 1.2em;
		font-weight: 700;
		min-width: 10rem;
	}

	button:hover {
		background: var(--secondary-color);
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	button.share-button {
		background: var(--cta-color);
	}

	button.share-button:hover {
		background: #3388de;
	}

	button.daily-button {
		background: #04883b;
	}

	button.daily-button:hover {
		background: var(--correct-color);
	}

	.daily-text {
		height: 3rem;
		font-size: 1.2em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.countdown {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		align-content: space-around;
		text-align: center;
		font-size: 1.2em;
	}

	.countdown strong {
		font-size: 1.6em;
		padding: 0 0.6rem;
	}

	@media (max-width: 480px) {
		.column {
			flex-basis: max-content;
		}
		.countdown strong {
			font-size: 1.2em;
		}
	}
</style>
