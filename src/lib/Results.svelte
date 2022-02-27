<script lang="ts">
	import { trackEvent } from '$lib/plausible'
	import type { Board, GameMode } from '$lib/data-model'
	import { getDayEnd, getDayNumber } from '$lib/data-model'
	import { onMount } from 'svelte'
	import { answerDaily, guessesDaily, highContrast, lastPlayedDaily } from '$lib/store'
	import { get } from 'svelte/store'
	import { fade } from 'svelte/transition'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import {
		copyImage,
		copyText,
		drawResults,
		getEmojiGrid,
		getShareTitle,
		shareImage,
	} from '$lib/share'
	import Stats from '$lib/Stats.svelte'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer: string
	export let guesses: string[]
	export let boardContent: Board
	export let gameMode: GameMode
	export let gameFinished: boolean
	export let gameWon: boolean
	export let playDaily
	export let playRandom
	export let stats
	export let hash: string
	export let hardMode: boolean

	const _guessesDaily = get(guessesDaily)
	const dailyFinished =
		get(lastPlayedDaily) === getDayNumber() &&
		(_guessesDaily.length === 6 || _guessesDaily[_guessesDaily.length - 1] === get(answerDaily))

	let nextMS
	const updateNextMS = () => (nextMS = getDayEnd(get(lastPlayedDaily)) - new Date())
	updateNextMS()

	setInterval(() => {
		updateNextMS()
	}, 1000)

	$: nextWordReady = nextMS < 0

	const HOUR = 3600000
	const MINUTE = 60000

	const shareTitleText = getShareTitle({
		gameWon,
		guesses,
		gameMode,
		hardMode,
		day: get(lastPlayedDaily) + 1,
	})

	function shareText() {
		shareMenu = false
		trackEvent('resultShare')
		copyText(
			shareTitleText +
				'\n\n' +
				getEmojiGrid(guesses, answer) +
				(gameMode === 'random' ? `\nhttps://vegeta897.github.io/wordle-peaks/#${hash}` : '')
		)
	}

	let shareMenu
	let showShareButtons
	let imageShared

	let canvas: HTMLCanvasElement

	async function onShareImage() {
		shareMenu = false
		imageShared = true
		trackEvent('resultShare')
		await shareImage(canvas, gameMode === 'random' ? { hash } : { day: get(lastPlayedDaily) + 1 })
	}

	onMount(() =>
		drawResults(canvas, {
			highContrast: get(highContrast),
			boardContent,
			guesses,
			caption: shareTitleText,
		})
	)
</script>

<section>
	<h2>{gameFinished ? (gameWon ? 'You got it! 🎉' : 'Oh no! ☹️') : 'Stats'}</h2>
	{#if gameFinished && !gameWon}
		<p>The answer was <strong>{answer.toUpperCase()}</strong></p>
	{/if}
	<Stats {stats} {gameMode} />
	<div class="share">
		<div class="column">
			{#if nextWordReady || !dailyFinished}
				<div class="daily-text">Try today's word!</div>
			{:else}
				<div class="countdown">
					<h3>Next word</h3>
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
			{#if gameFinished}
				{#if shareMenu && showShareButtons}
					<div
						class="share-buttons"
						in:fade={{ duration: 150, easing: cubicOut }}
						out:fade={{ duration: 100, easing: cubicIn }}
						on:outroend={() => (showShareButtons = false)}
					>
						<button on:click={shareText} class="share-button">Text</button>
						<button on:click={onShareImage} class="share-button">Image</button>
					</div>
				{:else if !shareMenu && !showShareButtons}
					<button
						in:fade={{ duration: 150, easing: cubicOut }}
						out:fade={{ duration: 100, easing: cubicIn }}
						on:outroend={() => (showShareButtons = true)}
						on:click={() => (shareMenu = true)}
						class="share-button">Share</button
					>
				{/if}
			{/if}
			{#if gameMode === 'random' || !dailyFinished}
				<button on:click={playDaily} class="daily-button">Play Daily</button>
			{/if}
			<button on:click={playRandom}>Play Random</button>
		</div>
	</div>
	<div class="image-share" class:hidden={!imageShared}>
		<canvas bind:this={canvas} width="252" height="0" />
		<button on:click={() => copyImage(canvas)} class="share-button">Copy Image</button>
	</div>
</section>

<style>
	section {
		padding: 0 1rem 1rem;
	}

	h2 {
		font-size: 1.5em;
		margin: 0.6rem 0 1.2rem;
	}

	h3 {
		margin: 0.5rem 0;
	}

	h2,
	h3,
	p {
		text-align: center;
	}

	.share {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		color: var(--text-color);
	}

	.column {
		display: flex;
		flex: 1 1 0;
		justify-content: space-around;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
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

	.share-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.share-buttons button {
		min-width: 3rem;
		width: 50%;
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

	.image-share {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.8rem;
	}

	.image-share canvas {
		padding: 4px;
		border: 1px solid var(--primary-color);
		box-shadow: 0 0 8px var(--primary-color);
	}

	.hidden {
		display: none;
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
