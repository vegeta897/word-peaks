<script lang="ts">
	import Toggle from 'svelte-toggle'
	import Select from 'svelte-select'
	import * as store from '$src/store'
	import type { Writable } from 'svelte/store'
	import { get, writable } from 'svelte/store'
	import { toast } from '@zerodevx/svelte-toast'
	import { beforeUpdate, onMount } from 'svelte'
	import { keyboardLayoutOptions } from '$lib/data-model'
	import { loadTranslations, t } from '$lib/translations'
	import lang from '$lib/translations/lang.json'
	import Screen from '$com/Screen.svelte'

	const languages = Object.entries(lang).map(([value, label]) => ({ value, label }))

	const { storedLocale, keyboardLayout, highContrast, showAllHints } = store

	let _keyboardLayoutOptions = [...keyboardLayoutOptions]

	async function onLanguageChange(language: string) {
		storedLocale.set(language)
		await loadTranslations(language)
		_keyboardLayoutOptions.find((o) => o.value === 'alphabetic')!.label = get(t)(
			'main.options.alphabetic'
		)
		_keyboardLayoutOptions = _keyboardLayoutOptions
	}

	const hardModeToggle: Writable<boolean> = writable(false)
	function toggleHardMode() {
		try {
			store.changeHardMode(!get(hardModeToggle))
		} catch (err) {
			toast.pop()
			toast.push(err as string, { theme: { '--toastBackground': 'var(--error-color)' } })
		}
	}

	const toggle = (prop: Writable<boolean>) => () => prop.set(!get(prop))

	const toggleOptions = [
		{ bind: hardModeToggle, label: 'main.options.hard_mode', click: toggleHardMode },
		{
			bind: highContrast,
			label: 'main.options.high_contrast_mode',
			click: toggle(highContrast),
		},
		{
			bind: showAllHints,
			label: 'main.options.show_all_hints',
			click: toggle(showAllHints),
		},
		{
			bind: store.swapEnterBackspace,
			label: 'main.options.swap_enter_backspace',
			click: toggle(store.swapEnterBackspace),
		},
		{
			bind: store.dyslexicFont,
			label: 'main.options.use_dyslexic_font',
			click: toggle(store.dyslexicFont),
		},
		{
			bind: store.allowDancing,
			label: 'main.options.allow_dancing_letters',
			click: toggle(store.allowDancing),
		},
		{
			bind: store.preciseTimes,
			label: 'main.options.show_precise_times',
			click: toggle(store.preciseTimes),
		},
	]

	beforeUpdate(() => {
		hardModeToggle.set(get(store.hardMode))
	})
	onMount(() => onLanguageChange(get(storedLocale)))

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
					on:select={({ detail: { value } }) => onLanguageChange(value)}
					isClearable={false}
					isSearchable={false}
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
				on:select={({ detail: { value } }) => keyboardLayout.set(value)}
				isClearable={false}
				isSearchable={false}
				containerStyles="color: var(--primary-color);flex: 1 1 auto;width:13rem;"
				inputStyles="box-sizing: border-box;"
			/>
		</div>
		{#each toggleOptions as toggleOption}
			<Toggle
				toggled={get(toggleOption.bind)}
				on:click={toggleOption.click}
				hideLabel
				label={$t(toggleOption.label)}
				style="transform: scale(1.6); touch-action: manipulation; flex-basis: 2.5rem;"
				toggledColor="var(--accent-color)"
				untoggledColor="#695d6e"><div class="label">{$t(toggleOption.label)}</div></Toggle
			>
		{/each}
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
		font-size: 1.2em;
		margin: 0.8rem 0;
		padding: 0.4rem 0.8rem 0.4rem 0;
	}

	@media (max-width: 480px) {
		.label {
			flex-grow: 1;
		}
	}

	@media (max-width: 400px) {
		.select-container {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
