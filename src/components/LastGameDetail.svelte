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
		aprilFools,
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
	const getGuessTimes = () => guessTimeElements.map((e) => e.span!.innerText)

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
			totalTime = `\n  ${get(t)('main.summary.total_time')}: ${
				totalTimeElement.span!.innerText
			}`
			emojiGridParams.guessTimes = getGuessTimes()
		}
		let url = ''
		if (get(store.shareURL)) {
			url = '\nhttps://wordpeaks.com'
			if (lastGameDetail!.hash) url += `/#${lastGameDetail!.hash}`
		}
		copyText(
			shareTitleText + '\n\n' + getEmojiGrid(emojiGridParams) + totalTime + url
		).then(
			() => successToast(get(t)('main.messages.score_copied')),
			() => errorToast()
		)
	}

	async function onShareImage() {
		shareMenu = false
		imageShared = true
		drawResults(canvas, {
			highContrast: get(store.highContrast),
			boardContent: get(store.boardContent),
			guesses: get(store.guesses),
			caption: shareTitleText,
			guessTimes: get(store.shareTimes) ? getGuessTimes() : undefined,
			totalTime: get(store.shareTimes) ? totalTimeElement.span!.innerText : undefined,
			showURL: get(store.shareURL),
			hash: lastGameDetail!.hash || undefined,
		})
		trackEvent('resultShare')
		await shareImage(
			canvas,
			lastGameDetail!.mode === 'random'
				? { hash: lastGameDetail!.hash || undefined }
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
	})

	const isAprilFools = aprilFools()
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
					ms={lastGameDetail.guessTimes[lastGameDetail.guessTimes.length - 1] -
						lastGameDetail.guessTimes[0]}
					decimals={$store.preciseTimes ? 2 : 0}
				/>
			</strong>
			{$t('main.summary.total_time')}
			{#if lastGameDetail.fastest}<div class="new-tag">
					{$t('main.messages.new_best')}
				</div>{/if}
		</div>
	</div>
	<div class="time-stats">
		{#each lastGameDetail.guesses as guess, g}
			{@const peaRow = isAprilFools && g === lastGameDetail.guesses.length - 1}
			<div class="guess-row">
				{#if peaRow}
					<svg class="pea-pod" viewBox="0 0 205 43">
						<path
							d="M6.558,7.019c21.249,12.439 78.259,14.642 103.137,14.642c24.877,-0 82.144,-6.025 94.778,2.701c-5.183,8.163 -21.831,11.422 -21.831,11.422l-151.077,0.648c-0,-0 -16.844,-19.177 -25.007,-29.413Z"
							style="fill:#3e7332;"
						/>
					</svg>
				{/if}
				<div class="guess-word">
					{#each guess as letter, l}
						<div
							class="guess-letter"
							class:before={letter < lastGameDetail.answer[l]}
							class:after={letter > lastGameDetail.answer[l]}
							class:pea={isAprilFools && letter === lastGameDetail.answer[l]}
							on:click={(e) => peaRow && hopPea(e.target)}
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
				<div class="time-value">
					<Time
						bindContainer={guessTimeElements[g]}
						ms={lastGameDetail.guessTimes[g + 1] - lastGameDetail.guessTimes[g]}
						decimals={$store.preciseTimes ? 2 : 0}
					/>
				</div>
			</div>
		{/each}
	</div>
	{#if isAprilFools}<p style="font-size: 1.2em; font-weight: bold; margin-bottom: 0;">
			Hap-<span style="color: var(--correct-color)">pea</span> April Fool's Day!
		</p>{/if}
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
	<div class="image-share" style:display={imageShared && !shareMenu ? 'flex' : 'none'}>
		<canvas bind:this={canvas} />
		<button on:click={onCopyImage}>{$t('main.results.copy_image')}</button>
	</div>
	{#if !shareMenu}
		<div class="promo">
			<a
				on:auxclick={() => trackEvent('promoLinkFollow')}
				on:click={() => trackEvent('promoLinkFollow')}
				href="https://buymeacoffee.com/vegeta897">☕ Buy me a coffee</a
			>
		</div>
	{/if}
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
		position: relative;
	}

	.pea-pod {
		width: 205px;
		position: absolute;
		left: -26px;
		top: -7px;
		pointer-events: none;
	}

	.guess-word {
		display: flex;
		width: 190px;
		position: relative;
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
	.guess-letter.pea {
		border-radius: 100%;
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
		border-radius: 6px;
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
	}

	.promo {
		margin-top: 1.25rem;
		text-align: center;
		line-height: 1.5rem;
		font-size: 1.2em;
	}

	@media (max-width: 360px) {
		.info-item {
			font-size: 0.9em;
		}
		.pea-pod {
			width: 185px;
			left: -22px;
			top: -5px;
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
