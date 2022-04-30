<script lang="ts">
	import { trackEvent } from '$lib/plausible'
	import type { GameMode } from '$lib/data-model'
	import { getDayEnd, getDayNumber } from '$lib/data-model'
	import { onMount } from 'svelte'
	import * as store from '$src/store'
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
	import Stats from '$com/Stats.svelte'
	import { t } from '$lib/translations'
	import { toast } from '@zerodevx/svelte-toast'
	import Screen from '$com/Screen.svelte'
	import LastGameDetail from '$com/LastGameDetail.svelte'
	import Time from '$com/Time.svelte'
	import Tabs from '$com/Tabs.svelte'
	import type { GameDetail } from '$lib/stats'

	// Don't use store, we don't want/need dynamic content for the results
	let lastAnswer: string
	let lastGameMode: GameMode
	let lastGameFinished: boolean
	let lastGameWon: boolean
	let lastGameDetail: GameDetail | null
	export let playDaily: () => {}
	export let playRandom: () => {}
	export let hash: string

	const _guessesDaily = get(store.guessesDaily)
	const _lastPlayedDaily = get(store.lastPlayedDaily)
	const dailyFinished =
		_lastPlayedDaily === getDayNumber() &&
		(_guessesDaily.length === 6 ||
			_guessesDaily[_guessesDaily.length - 1] === get(store.answerDaily))

	const nextDailyTime = getDayEnd(_lastPlayedDaily)
	let nextWordReady = nextDailyTime < new Date()
	setInterval(() => (nextWordReady = nextDailyTime < new Date()), 1000)

	let shareTitleText: string

	const successToast = (message: string) =>
		toast.push(message, {
			theme: { '--toastBackground': 'var(--cta-color)' },
		})
	const errorToast = () =>
		toast.push(get(t)('main.messages.could_not_do'), {
			theme: { '--toastBackground': 'var(--cta-color)' },
		})

	function shareText() {
		shareMenu = false
		trackEvent('resultShare')
		copyText(
			shareTitleText +
				'\n\n' +
				getEmojiGrid(get(store.guesses), get(store.answer)) +
				(lastGameMode === 'random' ? `\nhttps://vegeta897.github.io/wordle-peaks/#${hash}` : '')
		).then(
			() => successToast(get(t)('main.messages.score_copied')),
			() => errorToast()
		)
	}

	let shareMenu: boolean
	let showShareButtons: boolean
	let imageShared: boolean

	let canvas: HTMLCanvasElement

	async function onShareImage() {
		shareMenu = false
		imageShared = true
		trackEvent('resultShare')
		await shareImage(canvas, lastGameMode === 'random' ? { hash } : { day: _lastPlayedDaily + 1 })
	}

	function onCopyImage() {
		try {
			copyImage(canvas)
			successToast(get(t)('main.messages.image_copied'))
		} catch (e) {
			errorToast()
		}
	}

	onMount(() => {
		lastGameMode = get(store.gameMode)
		lastGameFinished = get(store.gameFinished)
		lastGameWon = get(store.gameWon)
		lastAnswer = get(store.answer)
		lastGameDetail = get(store.lastGameDetail)

		shareTitleText = getShareTitle({
			gameWon: get(store.gameWon),
			guesses: get(store.guesses),
			gameMode: lastGameMode,
			hardMode: get(store.lastPlayedWasHard),
			day: _lastPlayedDaily + 1,
		})
		drawResults(canvas, {
			highContrast: get(store.highContrast),
			boardContent: get(store.boardContent),
			guesses: get(store.guesses),
			caption: shareTitleText,
		})
	})
</script>

<Screen
	title={lastGameFinished
		? lastGameWon
			? `${$t('main.results.win')} 🎉`
			: `${$t('main.results.lose')} ☹️`
		: ''}
>
	{#if lastGameFinished && !lastGameWon}
		<h3 class="answer">{@html $t('main.results.answer', { answer: lastAnswer.toUpperCase() })}</h3>
	{/if}
	<div class="next-up">
		<div class="column">
			<div class="countdown">
				<Time alwaysShowHours countdown={nextDailyTime} class="time">
					<div slot="after-countdown" class="daily-text">{$t('main.results.try_today')}</div>
					<h3 slot="title">{$t('main.results.next_word')}</h3>
				</Time>
			</div>
		</div>
		<div class="column">
			{#if lastGameFinished}
				{#if shareMenu && showShareButtons}
					<div
						class="share-buttons"
						in:fade={{ duration: 150, easing: cubicOut }}
						out:fade={{ duration: 100, easing: cubicIn }}
						on:outroend={() => (showShareButtons = false)}
					>
						<button on:click={shareText} class="share-button">{$t('main.results.text')}</button>
						<button on:click={onShareImage} class="share-button">{$t('main.results.image')}</button>
					</div>
				{:else if !shareMenu && !showShareButtons}
					<button
						in:fade={{ duration: 150, easing: cubicOut }}
						out:fade={{ duration: 100, easing: cubicIn }}
						on:outroend={() => (showShareButtons = true)}
						on:click={() => (shareMenu = true)}
						class="share-button">{$t('main.results.share')}</button
					>
				{/if}
			{/if}
			{#if lastGameMode === 'random' || nextWordReady || !dailyFinished}
				<button on:click={playDaily} class="play-button">{$t('main.results.play_daily')}</button>
			{/if}
			<button on:click={playRandom} class="play-button">{$t('main.results.play_random')}</button>
		</div>
	</div>
	<div class="image-share" class:hidden={!imageShared}>
		<canvas bind:this={canvas} width="504" height="0" style={'width:252px'} />
		<button on:click={onCopyImage} class="share-button">{$t('main.results.copy_image')}</button>
	</div>
	<div class="tabs-container">
		{#if lastGameDetail && lastGameMode === lastGameDetail.mode && lastAnswer === lastGameDetail.answer}
			<Tabs tab1Title={$t('main.summary.title')} tab2Title={$t('main.stats.title')}>
				<LastGameDetail {lastGameDetail} slot="tab-1" />
				<Stats slot="tab-2" gameMode={lastGameMode} />
			</Tabs>
		{:else}
			<Stats gameMode={lastGameMode} />
		{/if}
	</div>
</Screen>

<style>
	h3 {
		font-size: 1.2em;
		margin: 0 0 0.3rem;
		width: 100%;
	}

	h3.answer {
		text-align: center;
		margin: 1.2rem 0;
	}

	.next-up {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		color: var(--text-color);
	}

	.column {
		width: 50%;
		display: flex;
		flex: 1 1 0;
		justify-content: space-around;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	button {
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-size: 1.2em;
		font-weight: 700;
		min-width: 10rem;
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

	button.play-button {
		background: #04883b;
	}

	button.play-button:hover {
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

	.countdown :global(.time) {
		font-weight: 700;
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
		/*transform: scale(0.5);*/
	}

	.hidden {
		display: none;
	}

	.tabs-container {
		background: var(--tertiary-color);
		border-radius: 1rem;
		margin-top: 1.4rem;
	}

	@media (max-width: 400px) {
		.next-up {
			flex-direction: column;
		}
		.column {
			width: 100%;
		}
		h3 {
			width: auto;
		}
		.countdown :global(.time) {
			font-size: 1.6em;
		}
	}
</style>
