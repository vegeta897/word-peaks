<script lang="ts">
	import Toggle from './Toggle.svelte'
	import { trackEvent } from '$lib/plausible'
	import { get } from 'svelte/store'
	import { t } from '$lib/translations'
	import * as store from '$src/store'
	import { toast } from '@zerodevx/svelte-toast'
	import { copyText, getShareTitle, getEmojiGrid, aprilFools } from '$lib/share'
	import { onDestroy, onMount } from 'svelte'
	import Time from './Time.svelte'
	import {
		getDayEndTime,
		getRandomWord,
		playDaily,
		playRandom,
		type GameMode,
	} from '$lib/game'
	import Icon from './landscape/Icon.svelte'
	import { getHerdText } from '$lib/herd'
	import ImageResults from './ImageResults.svelte'

	const { landscapeWideView, landscapeForceColor, landscapeRedraw, hideLandscape } = store

	export let gameMode: GameMode

	let showScoreShareMenu: boolean
	const shareTitleText = getShareTitle({
		gameWon: get(store.gameWon),
		guesses: get(store.guesses),
		gameMode: get(store.lastGameDetail)!.mode,
		hardMode: get(store.lastPlayedWasHard),
		day: get(store.lastGameDetail)!.dayNumber,
	})
	let landscapeRedrawCooldown = false

	const toastOptions = { theme: { '--toastBackground': 'var(--cta-color)' } }
	const successToast = (message: string) => toast.push(message, toastOptions)
	const errorToast = () => toast.push(get(t)('main.messages.could_not_do'), toastOptions)

	const toggleOptions = [
		{
			store: store.shareURL,
			label: 'main.options.include_link',
		},
		{
			store: store.shareTimes,
			label: 'main.options.include_times',
		},
		{
			store: store.hideArrows,
			label: 'main.options.hide_arrows',
		},
	]

	function shareText() {
		showScoreShareMenu = false
		trackEvent('resultShare')
		const emojiGridParams: Parameters<typeof getEmojiGrid>[0] = {
			guesses: get(store.guesses),
			answer: get(store.answer),
			hideArrows: get(store.hideArrows),
		}
		let totalTime = ''
		if (get(store.shareTimes)) {
			totalTime = `\n  ${get(t)('main.summary.total_time')}: ${get(
				store.totalGuessTimeString
			)}`
			emojiGridParams.guessTimes = get(store.guessTimeStrings)
		}
		let url = ''
		const lastGameDetail = get(store.lastGameDetail)!
		if (get(store.shareURL)) {
			url = '\nhttps://wordpeaks.com'
			if (lastGameDetail.hash) url += `/#${lastGameDetail.hash}`
		}
		copyText(
			shareTitleText +
				'\n' +
				(aprilFools() ? getHerdText(get(store.boardContent)) : '') +
				'\n' +
				getEmojiGrid(emojiGridParams) +
				totalTime +
				url
		).then(
			() => successToast(get(t)('main.messages.score_copied')),
			() => errorToast()
		)
	}

	let imageResultsComponent: ImageResults

	function onBoardImageShare() {
		showScoreShareMenu = false
		imageResultsComponent.shareBoardImage()
	}

	function onLandscapeShare() {
		showScoreShareMenu = false
		imageResultsComponent.shareLandscapeImage()
	}

	const nextDailyTime = getDayEndTime(get(store.lastPlayedDaily))
	let nextWordReady = nextDailyTime < Date.now()

	onMount(() => {
		const nextWordInterval = setInterval(
			() => (nextWordReady = nextDailyTime < Date.now()),
			1000
		)
		return () => clearInterval(nextWordInterval)
	})
</script>

<div class="container">
	<div class="actions" class:full-width={showScoreShareMenu}>
		{#if showScoreShareMenu}
			<div class="results-buttons">
				<button on:click={shareText}>{$t('main.results.text')}</button>
				<button on:click={onBoardImageShare}>{$t('main.results.image')}</button>
			</div>
			<div class="results-options">
				{#each toggleOptions as { store, label }}
					<Toggle {store} label={$t(label)} small />
				{/each}
			</div>
		{:else}
			<div class="action-items">
				<button on:click={() => (showScoreShareMenu = true)}>
					{$t('main.results.share')}
				</button>
				{#if gameMode === 'daily'}
					{#if nextWordReady}
						<button class="play-button" on:click={playDaily}>
							{$t('main.results.play_daily')}
						</button>
					{:else}
						<div class="countdown">
							<Time mode="countdown" alwaysShowHours ms={nextDailyTime} class="time">
								<h3 slot="title">{$t('main.results.next_word')}</h3>
							</Time>
						</div>
					{/if}
				{:else}
					<button class="play-button" on:click={() => playRandom(getRandomWord())}>
						{$t('main.results.play_random')}
					</button>
				{/if}
			</div>
		{/if}
	</div>
	{#if !showScoreShareMenu && !$hideLandscape}
		<div class="landscape-controls">
			<button
				title={$t('main.other.wide_view')}
				class:cta-bg={$landscapeWideView}
				on:click={() => landscapeWideView.set(!$landscapeWideView)}
			>
				<Icon icon="wide" active={$landscapeWideView} />
			</button>
			<button
				title={$t('main.other.color')}
				class:cta-bg={$landscapeForceColor}
				on:click={() => landscapeForceColor.set(!$landscapeForceColor)}
			>
				<Icon icon="color" active={$landscapeForceColor} />
			</button>
			<button
				title={$t('main.other.redraw')}
				disabled={landscapeRedrawCooldown}
				on:click={() => {
					landscapeRedrawCooldown = true
					setTimeout(() => (landscapeRedrawCooldown = false), 2000)
					landscapeRedraw.set(true)
				}}
			>
				<Icon icon="redraw" />
			</button>
			<button title={$t('main.results.share')} on:click={onLandscapeShare}>
				<Icon icon="photo" />
			</button>
			<div class="promo">
				<a
					on:auxclick={() => trackEvent('promoLinkFollow')}
					on:click={() => trackEvent('promoLinkFollow')}
					href="https://www.youtube.com/watch?v=W1dyNcRGRXY"
				>
					<span class="hide-on-small-screens">abolish & prosecute ICE</span>
					<span class="hide-on-big-screens">abolish ICE</span>
				</a>
			</div>
		</div>
	{/if}
</div>
<ImageResults bind:this={imageResultsComponent} {shareTitleText} />

<style>
	.container {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.actions {
		width: calc(var(--board-width) - 0.5rem);
		height: 100%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 0.75rem;
		background: var(--secondary-color);
	}

	.full-width {
		width: 100%;
	}

	.action-items {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
	}

	.play-button {
		background: #04883b;
	}
	.play-button:hover {
		background: var(--correct-color);
	}

	.countdown {
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
	}

	.countdown h3 {
		font-size: 1.25em;
		margin: 0 0 0.3rem;
	}

	.countdown :global(.time) {
		font-weight: 700;
		font-size: 1.5em;
		padding: 0 0.6rem;
	}

	.landscape-controls {
		flex: 1 0 92px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		box-sizing: border-box;
	}

	.landscape-controls button {
		background: var(--primary-color);
		transition: opacity 300ms ease-out;
		padding: 0.5rem 0;
	}

	.landscape-controls button:hover {
		background: var(--secondary-color);
		text-decoration: none;
	}

	.landscape-controls button:disabled {
		opacity: 0.5;
	}

	.landscape-controls button.cta-bg {
		background: var(--cta-color);
	}

	.landscape-controls .promo {
		grid-column: 1 / span 2;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
		border: 0;
		padding: 0;
		font-size: 1.5em;
		font-weight: 700;
		background: var(--cta-color);
	}

	button:hover {
		background: #3388de;
	}

	.results-buttons {
		width: calc(var(--board-width) - 2.5rem);
		height: 100%;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
	}

	.results-options {
		max-width: 220px;
		flex-grow: 1;
		margin: 0 auto;
		padding: 0 0.25rem 0 0.5rem;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		--toggle-scale: 1.2;
	}

	.hide-on-big-screens {
		display: none;
	}

	@media (max-width: 490px) {
		.hide-on-small-screens {
			display: none;
		}
		.hide-on-big-screens {
			display: initial;
		}
	}

	@media (max-width: 430px) {
		button {
			font-size: 1.25em;
		}
		.actions {
			padding: 0.5rem;
		}
		.results-buttons {
			width: 50%;
		}
		.results-options {
			font-size: 0.75em;
			--toggle-scale: 1;
		}
		.landscape-controls {
			gap: 0.375rem;
		}
	}

	@media (max-width: 340px) {
		.actions {
			width: 100%;
		}
		.landscape-controls {
			display: none;
		}
	}
</style>
