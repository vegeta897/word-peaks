<script lang="ts">
	import { alphabet } from '$lib/data-model'

	const keyboardLayout = [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm'],
	]
	export let typeLetter
	export let submitRow
	export let undoLetter
	export let correctLetter
	export let invalidLetters

	function handleKeydown({ key }) {
		if (alphabet.includes(key)) typeLetter(key)
		if (key === 'Backspace') undoLetter()
		if (key === 'Enter') submitRow()
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="keyboard">
	{#each keyboardLayout as keyRow, r}
		<div class="key-row">
			{#if r === 2}<button on:click={submitRow} class="wide">Enter</button>{/if}
			{#each keyRow as key}
				<button
					on:click={() => typeLetter(key)}
					class:correct={correctLetter === key}
					class:invalid={invalidLetters.has(key)}>{key}</button
				>
			{/each}
			{#if r === 2}<button on:click={undoLetter} class="wide">Delete</button>{/if}
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
		margin-bottom: 0.25rem;
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
	}

	.key-row button.correct {
		background: var(--correct-color);
	}

	.key-row button.invalid {
		background: var(--secondary-color);
		color: #777;
	}

	.key-row button.wide {
		width: 74px;
		text-transform: none;
	}

	@media (max-width: 480px) {
		.key-row button {
			width: 38px;
		}
		.key-row button.wide {
			width: 52px;
		}
	}
</style>
