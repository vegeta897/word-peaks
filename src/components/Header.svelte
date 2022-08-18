<script lang="ts">
	import { t } from '$lib/translations'
	import { openScreen, highContrast, gameMode, lastPlayedDaily } from '$src/store'
	import { OptionsIconPathData } from '$lib/icons'
	import { browser } from '$app/env'
</script>

<header class:high-contrast={$highContrast}>
	<div class="heading-container">
		<h1>Wordle Peaks</h1>
		{#if browser}<div class="game-mode" class:large={$gameMode === 'random'}>
				{$gameMode === 'daily' ? `#${$lastPlayedDaily + 1}` : '∞'}
			</div>{/if}
	</div>
	<div class="buttons" style:visibility={browser ? 'visible' : 'hidden'}>
		<button
			title={$t('main.tutorial.title')}
			class="test"
			on:click={() => openScreen.set('tutorial')}><span>?</span></button
		>
		<button title={$t('main.stats.title')} on:click={() => openScreen.set('results')}>
			<svg viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<g transform="rotate(180 4.5 4.5)">
					<rect id="gr1" x="0" y="0" height="8" width="2" />
					<rect id="gr2" x="3" y="0" height="5" width="2" />
					<rect id="gr3" x="6" y="0" height="2" width="2" />
				</g>
			</svg>
		</button>
		<button
			title={$t('main.options.title')}
			class="hover-spin"
			on:click={() => openScreen.set('options')}
		>
			<svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<path d={OptionsIconPathData} />
			</svg>
		</button>
	</div>
</header>

<style>
	header {
		transition: width 400ms ease-in-out;
		margin: 10px auto;
		padding: 0 8px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.heading-container {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 8px;
	}

	h1 {
		text-align: left;
		margin: 0;
	}

	.game-mode {
		color: #888;
		font-size: 1em;
	}

	.game-mode.large {
		font-size: 1.5em;
		line-height: 0.5em;
	}

	.buttons {
		display: flex;
	}

	header button {
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		padding: 0;
		width: 45px;
		height: 45px;
		margin-left: 10px;
		border-radius: 8px;
		border: 0;
		font-weight: 700;
		font-size: 1.4em;
		color: #888;
		background-color: #ffffff0a;
		transition: background-color 120ms ease-out;
		font-family: var(--font-list);
	}

	header button:hover {
		color: var(--text-color);
		background-color: var(--secondary-color);
	}

	header button svg {
		fill: #888;
	}
	header button:hover svg {
		fill: var(--text-color);
	}

	header button.test span {
		transition: font-size 150ms ease-in-out, transform 200ms ease-in-out 150ms;
	}

	header button.test:hover span {
		transform: scale(0.8);
		font-size: 150%;
	}

	#gr1,
	#gr3 {
		transition: transform 300ms ease-in-out;
	}

	header button:hover svg #gr1 {
		transform: scaleY(0.25);
	}

	header button:hover svg #gr3 {
		transform: scaleY(4);
	}

	header button.hover-spin svg {
		transition: transform 400ms ease-in-out;
	}
	header button.hover-spin:hover svg {
		transform: rotate(120deg);
	}

	.high-contrast button {
		background-color: var(--secondary-color);
	}

	@media (max-width: 390px) {
		header {
			margin: 6px auto;
		}
		header button {
			margin-left: 8px;
		}
		h1 {
			font-size: 1.4em;
		}
	}
</style>
