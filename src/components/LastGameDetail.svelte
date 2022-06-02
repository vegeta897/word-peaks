<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte'
	import { t } from '$lib/translations'
	import Time from '$com/Time.svelte'
	import type { GameDetail } from '$lib/stats'
	import type { Writable } from 'svelte/store'
	import { get } from 'svelte/store'
	import Toggle from 'svelte-toggle'
	import * as store from '$src/store'
	import {
		copyImage,
		copyText,
		drawResults,
		getEmojiGrid,
		getShareTitle,
		shareImage,
	} from '$lib/share'
	import { trackEvent } from '$lib/plausible'
	import { toast } from '@zerodevx/svelte-toast'

	export let lastGameDetail: GameDetail | null

	type SpanContainer = { span?: HTMLSpanElement }
	const totalTimeElement: SpanContainer = { span: undefined }
	const guessTimeElements: SpanContainer[] = []

	let canvas: HTMLCanvasElement
	let shareTitleText: string
	let shareMenu: boolean
	let imageShared: boolean

	const toastOptions = { theme: { '--toastBackground': 'var(--cta-color)' } }
	const successToast = (message: string) => toast.push(message, toastOptions)
	const errorToast = () => toast.push(get(t)('main.messages.could_not_do'), toastOptions)

	function shareText() {
		shareMenu = false
		trackEvent('resultShare')
		const emojiGridParams: Parameters<typeof getEmojiGrid>[0] = {
			guesses: get(store.guesses),
			answer: get(store.answer),
		}
		let totalTime = ''
		if (get(store.shareTimes)) {
			totalTime = `\n${get(t)('main.summary.total_time')}: ${totalTimeElement.span!.innerText}`
			emojiGridParams.guessTimes = guessTimeElements.map((e) => e.span!.innerText)
		}
		let url = ''
		if (get(store.shareURL)) {
			url = '\nhttps://wordlepeaks.com'
			if (lastGameDetail!.hash) url += `/#${lastGameDetail!.hash}`
		}
		copyText(shareTitleText + '\n\n' + getEmojiGrid(emojiGridParams) + totalTime + url).then(
			() => successToast(get(t)('main.messages.score_copied')),
			() => errorToast()
		)
	}

	async function onShareImage() {
		shareMenu = false
		imageShared = true
		trackEvent('resultShare')
		await shareImage(
			canvas,
			lastGameDetail!.mode === 'random'
				? { hash: lastGameDetail!.hash }
				: { day: lastGameDetail!.dayNumber }
		)
		canvas.scrollIntoView({ block: 'center' })
	}

	function onCopyImage() {
		try {
			copyImage(canvas)
			successToast(get(t)('main.messages.image_copied'))
		} catch (e) {
			errorToast()
		}
	}

	const toggle = (prop: Writable<boolean>) => () => prop.set(!get(prop))

	const toggleOptions = [
		{
			bind: store.shareURL,
			label: 'main.options.include_link',
			click: toggle(store.shareURL),
		},
		{
			bind: store.shareTimes,
			label: 'main.options.include_times',
			click: toggle(store.shareTimes),
		},
	]

	beforeUpdate(() => {
		if (guessTimeElements.length > 0) return
		lastGameDetail!.guesses.forEach(() => {
			guessTimeElements.push({ span: undefined })
		})
	})

	onMount(() => {
		shareTitleText = getShareTitle({
			gameWon: get(store.gameWon),
			guesses: get(store.guesses),
			gameMode: lastGameDetail!.mode,
			hardMode: get(store.lastPlayedWasHard),
			day: lastGameDetail!.dayNumber,
		})
		drawResults(canvas, {
			highContrast: get(store.highContrast),
			boardContent: get(store.boardContent),
			guesses: get(store.guesses),
			caption: shareTitleText,
		})
	})
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
					bindContainer={totalTimeElement}
					ms={lastGameDetail.guessTimes.at(-1) - lastGameDetail.guessTimes[0]}
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
					<Time
						bindContainer={guessTimeElements[g]}
						ms={lastGameDetail.guessTimes[g + 1] - lastGameDetail.guessTimes[g]}
					/>
				</div>
			</div>
		{/each}
	</div>
	<div class="share">
		{#if shareMenu}
			<div class="share-buttons">
				<button on:click={shareText}>{$t('main.results.text')}</button>
				<button on:click={onShareImage}>{$t('main.results.image')}</button>
			</div>
			<div class="share-options">
				{#each toggleOptions as toggleOption}
					<Toggle
						toggled={get(toggleOption.bind)}
						on:click={toggleOption.click}
						hideLabel
						label={$t(toggleOption.label)}
						style="transform: scale(1.6); touch-action: manipulation; flex-basis: 2.5rem;"
						toggledColor="var(--accent-color)"
						untoggledColor="#695d6e"
					>
						<div class="label">{$t(toggleOption.label)}</div>
					</Toggle>
				{/each}
			</div>
		{:else}
			<button on:click={() => (shareMenu = true)}>{$t('main.results.share')}</button>
		{/if}
	</div>
	<div class="image-share" style:display={imageShared ? 'flex' : 'none'}>
		<canvas bind:this={canvas} width="504" height="0" style={'width:252px'} />
		<button on:click={onCopyImage}>{$t('main.results.copy_image')}</button>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 0.5rem;
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

	.share {
		margin-top: 1.4rem;
		width: 100%;
		padding: 0 7%;
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}

	button {
		border-radius: 4px;
		border: 0;
		padding: 0 1rem;
		height: 3rem;
		font-size: 1.2em;
		font-weight: 700;
		min-width: 10rem;
		background: var(--cta-color);
	}

	button:hover {
		background: #3388de;
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	.share > button {
		font-size: 1.5em;
		height: 4rem;
		min-width: 15rem;
	}

	.share-buttons {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex-grow: 1;
	}

	.share-buttons button {
		margin: 0.3rem 0;
		min-width: 100%;
	}

	.share-options {
		max-width: 220px;
		margin: 0 1rem;
		flex-grow: 2;
	}

	.label {
		order: -1;
		flex-grow: 1.5;
		font-size: 1.2em;
		margin: 0.5rem 0;
		padding: 0.4rem 0.8rem 0.4rem 0;
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
