<script lang="ts">
	import Toggle from './Toggle.svelte'
	import Select from 'svelte-select'
	import * as store from '$src/store'
	import type { Writable } from 'svelte/store'
	import { get } from 'svelte/store'
	import { page } from '$app/stores'
	import { toast } from '@zerodevx/svelte-toast'
	import { onMount } from 'svelte'
	import { keyboardLayoutOptions } from '$lib/constants'
	import { loadTranslations, t } from '$lib/translations'
	import lang from '$lib/translations/lang.json'
	import Screen from '$com/Screen.svelte'
	import Tile from './Tile.svelte'

	const languages = Object.entries(lang).map(([value, label]) => ({ value, label }))

	const { storedLocale, keyboardLayout, tileSharpness } = store

	let _keyboardLayoutOptions = [...keyboardLayoutOptions]

	async function onLanguageChange(language: string) {
		storedLocale.set(language)
		await loadTranslations(language)
		_keyboardLayoutOptions.find((o) => o.value === 'alphabetic')!.label = get(t)(
			'main.options.alphabetic'
		)
		_keyboardLayoutOptions.find((o) => o.value === 'alphabetic_reversed')!.label = get(t)(
			'main.options.alphabetic_reversed'
		)
		_keyboardLayoutOptions = _keyboardLayoutOptions
	}

	function validateHardMode() {
		if (!get(store.gameFinished) && get(store.guesses).length > 0) {
			toast.pop()
			toast.push(get(t)('main.options.hard_mode_error'), {
				theme: { '--toastBackground': 'var(--error-color)' },
			})
			return false
		}
		return true
	}

	const toggleOptions: {
		store: Writable<boolean | undefined>
		label: string
		validate?: () => boolean
	}[] = [
		{
			store: store.hardMode,
			label: 'main.options.hard_mode',
			validate: validateHardMode,
		},
		{
			store: store.highContrast,
			label: 'main.options.high_contrast_mode',
		},
		{
			store: store.showAllHints,
			label: 'main.options.show_all_hints',
		},
		{
			store: store.previewInvalidWords,
			label: 'main.options.preview_invalid_words',
		},
		{
			store: store.swapEnterBackspace,
			label: 'main.options.swap_enter_backspace',
		},
		{
			store: store.dyslexicFont,
			label: 'main.options.use_dyslexic_font',
		},
		{
			store: store.hideLandscape,
			label: 'main.options.hide_landscape',
		},
		{
			store: store.allowDancing,
			label: 'main.options.allow_dancing_letters',
		},
		{
			store: store.preciseTimes,
			label: 'main.options.show_precise_times',
		},
	]

	onMount(() => {
		onLanguageChange(get(storedLocale))
		if (
			get(store.nlgEnabled) ||
			get(store.nlgid) ||
			get(page).url.searchParams.get('nlgid')
		) {
			toggleOptions.push({
				store: store.nlgEnabled,
				label: 'main.options.nlg_tracking',
			})
		}
	})

	$: keyboard = _keyboardLayoutOptions.find((o) => o.value === $keyboardLayout)!
	$: language = languages.find((o) => o.value === $storedLocale)!
</script>

<Screen title={$t('main.options.title')}>
	<div class="content">
		{#if languages.length > 1}
			<div class="select-container">
				<div class="label">{$t('main.options.language')}</div>
				<Select
					items={languages}
					value={{ label: language.label, value: $storedLocale }}
					on:change={({ detail: { value } }) => onLanguageChange(value)}
					clearable={false}
					searchable={false}
					containerStyles="color: var(--primary-color);flex: 1 1 auto;width:13rem;"
					inputStyles="box-sizing: border-box;"
				/>
			</div>
			{#if $storedLocale !== 'en'}<p>{@html $t('main.options.help_translate')}</p>{/if}
		{/if}
		<div class="select-container">
			<div class="label">{$t('main.options.keyboard_layout')}</div>
			<Select
				items={keyboardLayoutOptions}
				value={{ label: keyboard.label, value: $keyboardLayout }}
				on:change={({ detail: { value } }) => keyboardLayout.set(value)}
				clearable={false}
				searchable={false}
				containerStyles="color: var(--primary-color);flex: 1 1 auto;width:13rem;"
				inputStyles="box-sizing: border-box;"
			/>
		</div>
		<div class="toggle-container">
			{#each toggleOptions as { store, label, validate }}
				<Toggle {store} {validate} label={$t(label)} />
			{/each}
		</div>
		<div class="slider-container">
			<label>
				{$t('main.options.tile_sharpness')}
				<input
					type="range"
					bind:value={$tileSharpness}
					min="0"
					max="2"
					step="0.02"
					list="tileSharpnessOptions"
				/>
				<datalist id="tileSharpnessOptions">
					<option value="0.72" />
				</datalist>
			</label>
			<div style="margin-right: 0.25rem;">
				<Tile tile={{ scored: true, letter: 'w', distance: -1, id: 0, polarity: 0 }} />
			</div>
			<Tile tile={{ scored: true, letter: 'p', distance: 1, id: 0, polarity: 0 }} />
		</div>
	</div>
</Screen>

<style>
	.content {
		margin-top: 2.5rem;
		color: var(--text-color);
		--inputColor: var(--primary-color);
		--indicatorColor: #888;
	}

	.select-container {
		display: flex;
		flex-wrap: wrap;
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
		flex-grow: 1.5;
		font-size: 1.25em;
		margin: 0.8rem 0;
		padding: 0.4rem 0.8rem 0.4rem 0;
	}

	.toggle-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin: 1.5rem 0;
	}

	.slider-container {
		display: flex;
		margin-top: 0.75rem;
		margin-right: -7px;
		align-items: center;
	}

	.slider-container label {
		flex-grow: 1;
		font-size: 1.25em;
		display: flex;
		flex-direction: column;
		padding-right: 2rem;
	}

	.slider-container input {
		max-width: 16rem;
		margin-top: 1rem;
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		cursor: pointer;
		outline: none;
		border-radius: 0.75rem;
		background-color: #695d6e;
		overflow: hidden;
	}

	.slider-container input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background-color: #fff;
		border: none;
		box-shadow: -16.75rem 0 0 16rem var(--accent-color);
	}

	.slider-container input::-moz-range-thumb {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background-color: #fff;
		border: none;
		box-shadow: -16.75rem 0 0 16rem var(--accent-color);
	}

	@media (max-width: 480px) {
		.label {
			flex-grow: 1;
		}
		.label,
		.slider-container label {
			font-size: 1.125em;
		}
	}

	@media (max-width: 400px) {
		.select-container {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 360px) {
		.label,
		.slider-container label {
			font-size: 1em;
		}
	}
</style>
