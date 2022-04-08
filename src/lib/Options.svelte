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
		storedLocale,
	} from '$lib/store'
	import { get } from 'svelte/store'
	import { toast } from '@zerodevx/svelte-toast'
	import { beforeUpdate } from 'svelte'
	import { keyboardLayoutOptions } from '$lib/data-model'
	import { t } from '$lib/translations'
	import lang from '$lib/translations/lang.json'

	const languages = Object.entries(lang).map(([value, label]) => ({ value, label }))

	keyboardLayoutOptions.find((o) => o.value === 'alphabetic').label =
		get(t)('main.options.alphabetic')

	function toggleHardMode() {
		try {
			changeHardMode(!hardModeToggle)
		} catch (err) {
			toast.pop()
			toast.push(err, { theme: { '--toastBackground': 'var(--error-color)' } })
		}
	}
	let hardModeToggle: boolean

	beforeUpdate(() => {
		hardModeToggle = get(hardMode)
	})
</script>

<section>
	<h2>{$t('main.options.title')}</h2>
	<div class="content">
		<div class="select-container">
			<div class="label">{$t('main.options.language')}</div>
			<Select
				items={languages}
				value={{
					label: languages.find((o) => o.value === $storedLocale).label,
					value: $storedLocale,
				}}
				on:select={({ detail: { value } }) => storedLocale.set(value)}
				isClearable={false}
				isSearchable={false}
				containerStyles="color: var(--primary-color);width:10rem;"
			/>
		</div>
		<div class="select-container">
			<div class="label">{$t('main.options.keyboard_layout')}</div>
			<Select
				items={keyboardLayoutOptions}
				value={{
					label: keyboardLayoutOptions.find((o) => o.value === $keyboardLayout).label,
					value: $keyboardLayout,
				}}
				on:select={({ detail: { value } }) => keyboardLayout.set(value)}
				isClearable={false}
				isSearchable={false}
				containerStyles="color: var(--primary-color);width:8.2rem;"
			/>
		</div>
		<Toggle
			bind:toggled={hardModeToggle}
			on:click={toggleHardMode}
			hideLabel
			label={$t('main.options.hard_mode')}
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"
			untoggledColor="#695d6e"><div class="label">{$t('main.options.hard_mode')}</div></Toggle
		>
		<Toggle
			bind:toggled={$highContrast}
			hideLabel
			label={$t('main.options.high_contrast_mode')}
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"
			untoggledColor="#695d6e"
			><div class="label">{$t('main.options.high_contrast_mode')}</div></Toggle
		>
		<Toggle
			bind:toggled={$showAllHints}
			hideLabel
			label={$t('main.options.show_all_hints')}
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"
			untoggledColor="#695d6e"><div class="label">{$t('main.options.show_all_hints')}</div></Toggle
		>
		<Toggle
			bind:toggled={$swapEnterBackspace}
			hideLabel
			label={$t('main.options.swap_enter_backspace')}
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"
			untoggledColor="#695d6e"
			><div class="label">{$t('main.options.swap_enter_backspace')}</div></Toggle
		>
	</div>
</section>

<style>
	section {
		max-width: 20rem;
		margin: 0 auto 1.2rem;
		padding: 0 1rem;
		color: var(--text-color);
		--inputColor: var(--primary-color);
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
