<script lang="ts">
	import { t } from '$lib/translations'
	import { openScreen, highContrast } from '$src/store'
	import { OptionsIconPathData } from '$lib/icons'
</script>

<header class:high-contrast={$highContrast}>
	<h1>Wordle Peaks</h1>
	<button title={$t('main.tutorial.title')} class="test" on:click={() => openScreen.set('tutorial')}
		><span>?</span></button
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
</header>

<style>
	header {
		transition: width 400ms ease-in-out;
		margin: 0.6rem auto;
		padding: 0 8px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	h1 {
		text-align: left;
		margin: 0;
		flex-grow: 1;
	}

	header button {
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		padding: 0;
		width: 2.8rem;
		height: 2.8rem;
		margin-left: 0.6rem;
		border-radius: 8px;
		border: 0;
		font-weight: 700;
		font-size: 1.4em;
		color: #888;
		background-color: #ffffff0a;
		transition: background-color 100ms ease-out;
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

	@media (max-width: 360px) {
		h1 {
			font-size: 1.4em;
		}
	}
</style>
