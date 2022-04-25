<script lang="ts">
	import { alphabet, keyboardLayoutOptions } from '$lib/data-model'
	import { validLetters, swapEnterBackspace, keyboardLayout } from '$src/store'
	import { t } from '$lib/translations'
	import { moveCarat, submitRow, typeLetter, undoLetter } from '$lib/board'

	function handleKeydown({ key, ctrlKey }: KeyboardEvent) {
		if (ctrlKey) return
		if (key === 'Backspace') undoLetter()
		if (key === 'Delete') undoLetter(false)
		if (key === 'Enter') submitRow()
		if (key === 'ArrowLeft') moveCarat(-1)
		if (key === 'ArrowRight') moveCarat(1)
		key = key.toLowerCase()
		if (alphabet.includes(key) || key === ' ') typeLetter(key.trim())
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="keyboard">
	{#each keyboardLayoutOptions.find((o) => o.value === $keyboardLayout).layout as keyRow, r}
		<div class="key-row">
			{#if r === keyboardLayoutOptions.find((o) => o.value === $keyboardLayout).wideKeysRow}
				{#if $swapEnterBackspace}
					<button on:click={undoLetter} class="wide"
						><svg viewBox="0 0 21 11" xmlns="http://www.w3.org/2000/svg" width="42" height="22">
							<line x1="7" x2="21" y1="5" y2="5" />
							<polygon points="3,5 7,2 7,8" />
							<line x1="1" x2="1" y1="0.5" y2="9.5" />
						</svg></button
					>
				{:else}
					<button on:click={submitRow} class="wide">{$t('main.keyboard.enter')}</button>
				{/if}
			{/if}
			{#each keyRow as key}
				<button
					on:click={() => typeLetter(key)}
					class:correct={$validLetters.size === 1 && $validLetters.has(key)}
					class:invalid={!$validLetters.has(key)}>{key}</button
				>
			{/each}
			{#if r === keyboardLayoutOptions.find((o) => o.value === $keyboardLayout).wideKeysRow}{#if $swapEnterBackspace}
					<button on:click={submitRow} class="wide">{$t('main.keyboard.enter')}</button>
				{:else}
					<button on:click={undoLetter} class="wide">
						<svg viewBox="0 0 21 11" xmlns="http://www.w3.org/2000/svg" width="42" height="22">
							<line x1="7" x2="21" y1="5" y2="5" />
							<polygon points="3,5 7,2 7,8" />
							<line x1="1" x2="1" y1="0.5" y2="9.5" />
						</svg>
					</button>
				{/if}{/if}
		</div>
	{/each}
</div>

<style>
	.keyboard {
		user-select: none;
		padding: 0 4px;
		touch-action: manipulation;
	}

	.key-row {
		display: flex;
		justify-content: center;
		margin-bottom: 4px;
	}
	.key-row button {
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		padding: 0;
		margin-left: 0.125rem;
		margin-right: 0.125rem;
		width: 48px;
		height: 58px;
		border-radius: 4px;
		border: 0;
		font-weight: 700;
		font-size: 1.4em;
	}

	.key-row button.correct {
		background: var(--correct-color);
	}

	.key-row button.invalid {
		background: var(--secondary-color);
		color: #ccca;
	}

	.key-row button.wide {
		width: 74px;
		text-transform: none;
		font-size: 1em;
	}

	.key-row button.wide svg {
		max-width: 2.4em;
		stroke-width: 2;
		stroke: var(--text-color);
		fill: var(--text-color);
	}

	@media (max-width: 480px) {
		.key-row button {
			width: 38px;
			font-size: 1.3em;
		}

		.key-row button.wide {
			width: 59px;
			font-size: 0.9em;
		}

		.key-row button.wide svg {
			max-width: 2em;
		}
	}
</style>
