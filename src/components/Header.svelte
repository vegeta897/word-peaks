<script lang="ts">
	import { t } from '$lib/translations'
	import {
		openScreen,
		highContrast,
		gameMode,
		lastPlayedDaily,
		boardContent,
	} from '$src/store'
	import { OptionsIconPathData } from '$lib/icons'
	import { browser } from '$app/env'
	import { aprilFools } from '$lib/share'
	import { playDaily, playRandom } from '$lib/data-model'

	$: isAprilFools = $lastPlayedDaily && aprilFools()
	$: leakActive =
		isAprilFools && $boardContent.some((r) => r.some((t) => t.scored && t.distance > 0))
</script>

<header class:high-contrast={$highContrast}>
	<div class="heading-container">
		<h1>
			Word <span class:leak={leakActive}>{isAprilFools ? 'Leaks' : 'Peaks'}</span>
			{#if browser}
				<small class="game-mode" class:large={$gameMode === 'random'}>
					{$gameMode === 'daily' ? `#${$lastPlayedDaily + 1}` : '∞'}
					<!-- TODO: Replace infinity symbol with SVG icon -->
				</small>
			{/if}
		</h1>
		{#if browser}
			<div class="game-mode-buttons">
				<button on:click={playDaily} disabled={$gameMode === 'daily'}>
					{$t('main.summary.daily')}
				</button>
				<button on:click={() => playRandom()} disabled={$gameMode !== 'daily'}>
					{$t('main.summary.random')}
				</button>
			</div>
		{/if}
	</div>
	<div class="menu-buttons" style:visibility={browser ? 'visible' : 'hidden'}>
		<button
			title={$t('main.tutorial.title')}
			class="bulge"
			on:click={() => openScreen.set('tutorial')}><span>?</span></button
		>
		<button title={$t('main.stats.title')} on:click={() => openScreen.set('stats')}>
			<svg viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<g transform="rotate(180 4.5 4.5)">
					<rect id="graph_bar_1" x="0" y="0" height="8" width="2" />
					<rect x="3" y="0" height="5" width="2" />
					<rect id="graph_bar_3" x="6" y="0" height="2" width="2" />
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
		margin: 0.75rem auto 1rem;
		padding: 0 0.5rem;
		box-sizing: border-box;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.heading-container {
		display: flex;
		flex-direction: column;
		align-items: baseline;
	}

	h1 {
		margin: 0;
	}

	.game-mode {
		margin-left: 0.25rem;
		color: #888;
		font-size: 0.875em;
	}

	.game-mode.large {
		font-size: 1.25em;
		line-height: 0.5em;
		position: relative;
		top: 0.25rem;
	}

	.game-mode-buttons {
		display: flex;
		margin-top: 0.25rem;
	}

	.game-mode-buttons button {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 1.875rem;
		background-color: #ffffff0a;
		border: 0;
		border-radius: 0.25rem;
		padding: 0 0.875rem;
		font-weight: 700;
		font-size: 1em;
		color: #888a;
		transition: background-color 120ms ease-out;
	}

	.game-mode-buttons button:first-child {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.game-mode-buttons button:last-child {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.game-mode-buttons button:disabled {
		color: var(--text-color);
		background-color: var(--secondary-color);
		cursor: default;
	}

	.game-mode-buttons button:not(:disabled):hover {
		color: var(--text-color);
		background-color: var(--secondary-color);
	}

	.leak {
		color: var(--after-color);
		transition: color 2s ease-in;
	}

	.menu-buttons {
		display: flex;
	}

	.menu-buttons button {
		display: flex;
		justify-content: center;
		align-items: center;
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

	.menu-buttons button:hover {
		color: var(--text-color);
		background-color: var(--secondary-color);
	}

	.menu-buttons button svg {
		fill: #888;
	}
	.menu-buttons button:hover svg {
		fill: var(--text-color);
	}

	.menu-buttons button.bulge span {
		transition: font-size 150ms ease-in-out, transform 200ms ease-in-out 150ms;
	}

	.menu-buttons button.bulge:hover span {
		transform: scale(0.8);
		font-size: 150%;
	}

	#graph_bar_1,
	#graph_bar_3 {
		transition: transform 300ms ease-in-out;
	}

	.menu-buttons button:hover svg #graph_bar_1 {
		transform: scaleY(0.25);
	}

	.menu-buttons button:hover svg #graph_bar_3 {
		transform: scaleY(4);
	}

	.menu-buttons button.hover-spin svg {
		transition: transform 400ms ease-in-out;
	}
	.menu-buttons button.hover-spin:hover svg {
		transform: rotate(120deg);
	}

	.high-contrast button {
		background-color: var(--secondary-color);
	}

	@media (max-width: 390px) {
		.menu-buttons button {
			margin-left: 0.5rem;
		}
		h1 {
			font-size: 1.4em;
		}
	}
</style>
