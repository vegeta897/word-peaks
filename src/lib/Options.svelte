<script lang="ts">
	import Toggle from 'svelte-toggle'
	import Select from 'svelte-select'
	import {
		highContrast,
		showAllHints,
		hardMode,
		changeHardMode,
		swapEnterBackspace,
		keyboardLayout,
	} from '$lib/store'
	import { get } from 'svelte/store'
	import { toast } from '@zerodevx/svelte-toast'
	import { beforeUpdate } from 'svelte'
	import { keyboardLayoutOptions } from '$lib/data-model'

	function toggleHardMode() {
		try {
			changeHardMode(!hardModeToggle)
		} catch (err) {
			toast.pop()
			toast.push(err, { theme: { '--toastBackground': 'var(--error-color)' } })
		}
	}

	let hardModeToggle

	beforeUpdate(() => {
		hardModeToggle = get(hardMode)
	})
</script>

<section>
	<h2>Options</h2>
	<div class="content">
		<div class="select-container">
			<div class="label">Keyboard layout</div>
			<Select
				items={keyboardLayoutOptions}
				value={{
					label: keyboardLayoutOptions.find((o) => o.value === $keyboardLayout).label,
					value: $keyboardLayout,
				}}
				on:select={(d) => {
					keyboardLayout.set(d.detail.value)
					console.log(d)
				}}
				isClearable={false}
				isSearchable={false}
				containerStyles="color: var(--primary-color);"
			/>
		</div>
		<Toggle
			bind:toggled={hardModeToggle}
			on:click={toggleHardMode}
			hideLabel
			label="Hard mode"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">Hard mode</div></Toggle
		>
		<Toggle
			bind:toggled={$highContrast}
			hideLabel
			label="High contrast mode"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">High contrast mode</div></Toggle
		>
		<Toggle
			bind:toggled={$showAllHints}
			hideLabel
			label="Show all hints in row"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">Show all hints in row</div></Toggle
		>
		<Toggle
			bind:toggled={$swapEnterBackspace}
			hideLabel
			label="Swap Enter/Backspace keys"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">Swap Enter/Backspace keys</div></Toggle
		>
	</div>
</section>

<style>
	section {
		max-width: 20rem;
		margin: 0 auto 1.2rem;
		padding: 0 1rem;
		color: var(--text-color);
		--height: 2.3rem;
		--indicatorTop: 7px;
		--indicatorColor: #888;
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
		margin: 0.6rem 0 1rem;
	}

	.content {
		margin: 2.5rem 0;
	}

	.select-container {
		display: flex;
		align-items: center;
		margin-right: -7px;
		margin-bottom: 0.5rem;
	}

	.select-container .label {
		margin: 0;
	}

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.2em;
		margin: 0.8rem 0;
		padding-right: 0.8rem;
	}

	@media (max-width: 360px) {
		.label {
			font-size: 1em;
		}
	}
</style>
