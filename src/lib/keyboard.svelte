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

<div class="keyboard" style="">
	<div class="key-row">
		{#each keyboardLayout[0] as key}
			<button
				on:click={() => typeLetter(key)}
				class:correct={correctLetter === key}
				class:invalid={invalidLetters.has(key)}>{key}</button
			>
		{/each}
	</div>
	<div class="key-row">
		<div class="flex-one-half" />
		{#each keyboardLayout[1] as key}
			<button
				on:click={() => typeLetter(key)}
				class:correct={correctLetter === key}
				class:invalid={invalidLetters.has(key)}>{key}</button
			>
		{/each}
		<div class="flex-one-half" />
	</div>
	<div class="key-row">
		<button on:click={submitRow} class="flex-three-half big" style="">⮡</button>
		{#each keyboardLayout[2] as key}
			<button
				on:click={() => typeLetter(key)}
				class:correct={correctLetter === key}
				class:invalid={invalidLetters.has(key)}>{key}</button
			>
		{/each}
		<button on:click={undoLetter} class="flex-three-half big" style="padding-bottom: 0.3rem;"
			>⬅</button
		>
	</div>
</div>

<style>
	.keyboard {
		user-select: none;
		width: 484px;
		margin: auto 8px 0;
	}

	.key-row {
		display: flex;
		margin: 0 auto 8px;
		width: 100%;
	}
	.key-row button {
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		flex: 1;
		margin: 0 6px 0 0;
		padding: 0;
		height: 58px;
		border-radius: 4px;
		border: 0;
		font-weight: bold;
	}

	.key-row button.correct {
		background: var(--correct-color);
	}

	.key-row button.invalid {
		background: var(--secondary-color);
		color: #777;
	}

	.key-row button:last-of-type {
		margin: 0;
	}

	.flex-one-half {
		flex: 0.5;
	}
	.key-row button.flex-three-half {
		flex: 1.5;
	}

	.big {
		font-size: 2rem;
	}
</style>
