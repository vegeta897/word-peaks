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
	import type { Writable } from 'svelte/store'
	import { get, writable } from 'svelte/store'
	import { toast } from '@zerodevx/svelte-toast'
	import { beforeUpdate, onMount } from 'svelte'
	import { keyboardLayoutOptions } from '$lib/data-model'
	import { loadTranslations, t } from '$lib/translations'
	import lang from '$lib/translations/lang.json'
	import CloseButton from '$lib/CloseButton.svelte'

	const languages = Object.entries(lang).map(([value, label]) => ({ value, label }))

	async function onLanguageChange(language: string) {
		storedLocale.set(language)
		await loadTranslations(language)
		keyboardLayoutOptions.find((o) => o.value === 'alphabetic').label =
			get(t)('main.options.alphabetic')
	}

	const hardModeToggle: Writable<boolean> = new writable(false)
	function toggleHardMode() {
		try {
			changeHardMode(!get(hardModeToggle))
		} catch (err) {
			toast.pop()
			toast.push(err, { theme: { '--toastBackground': 'var(--error-color)' } })
		}
	}

	const toggle = (prop) => () => {
		prop.set(!get(prop))
	}

	const toggleOptions = [
		{ bind: hardModeToggle, label: 'main.options.hard_mode', click: toggleHardMode },
		{ bind: highContrast, label: 'main.options.high_contrast_mode', click: toggle(highContrast) },
		{ bind: showAllHints, label: 'main.options.show_all_hints', click: toggle(showAllHints) },
		{
			bind: swapEnterBackspace,
			label: 'main.options.swap_enter_backspace',
			click: toggle(swapEnterBackspace),
		},
	]

	beforeUpdate(() => {
		hardModeToggle.set(get(hardMode))
	})
	onMount(() => onLanguageChange(get(storedLocale)))
</script>

<section>
	<CloseButton />
	<h2>{$t('main.options.title')}</h2>
	<div class="content">
		{#if languages.length > 1}
			<div class="select-container">
				<div class="label">{$t('main.options.language')}</div>
				<Select
					items={languages}
					value={{
						label: languages.find((o) => o.value === $storedLocale).label,
						value: $storedLocale,
					}}
					on:select={({ detail: { value } }) => onLanguageChange(value)}
					isClearable={false}
					isSearchable={false}
					containerStyles="color: var(--primary-color);width:12.2rem;"
				/>
			</div>
		{/if}
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
				containerStyles="color: var(--primary-color);width:12.2rem;"
			/>
		</div>
		{#each toggleOptions as toggleOption}
			<Toggle
				toggled={get(toggleOption.bind)}
				on:click={toggleOption.click}
				hideLabel
				label={$t(toggleOption.label)}
				style="transform: scale(1.6); touch-action: manipulation;"
				toggledColor="var(--accent-color)"
				untoggledColor="#695d6e"><div class="label">{$t(toggleOption.label)}</div></Toggle
			>
		{/each}
	</div>
</section>

<style>
	section {
		position: relative;
		padding: 0 1.5rem;
		color: var(--text-color);
		--inputColor: var(--primary-color);
		--indicatorColor: #888;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 1.5rem 0 1rem;
	}

	.content {
		margin-top: 2.5rem;
	}

	.select-container {
		display: flex;
		align-items: center;
		margin-right: -7px;
		margin-top: 1rem;
		margin-bottom: 0.6rem;
	}

	.select-container .label {
		margin: 0;
	}

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.2em;
		margin: 1rem 0;
		padding-right: 0.8rem;
	}

	@media (max-width: 350px) {
		.label {
			font-size: 1em;
		}
	}
</style>
