<script lang="ts" context="module">
	import { base } from '$app/paths'
	import { copyText } from '$lib/share'
	import { t } from '$lib/translations'
	import { toast } from '@zerodevx/svelte-toast'
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { GameDetail, Stats, TimeStats } from '$lib/stats'
	import { STORE_VERSION } from '$src/store'
	import { WORD_LENGTH } from '$lib/data-model'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	const toastTheme = { theme: { '--toastBackground': 'var(--cta-color)' } }
	const isNumber = (maybeNumber: unknown) =>
		typeof maybeNumber === 'number' && maybeNumber >= 0
	const isNumberArray = (maybeNumberArray: unknown) =>
		maybeNumberArray instanceof Array && maybeNumberArray.every(isNumber)

	function validateImportText(importText: string) {
		if (!importText) return false
		try {
			const [version, lastDaily, stats, timeStats, dailyDetail] = JSON.parse(importText)
			if (version !== STORE_VERSION) throw 'bad-version'
			if (!isNumber(lastDaily)) throw 'invalid-last-daily'
			const [cs, bs, tg, wg, d] = stats
			if (
				!isNumber(cs) ||
				!isNumber(bs) ||
				!isNumber(tg) ||
				!isNumber(wg) ||
				!isNumberArray(d)
			)
				throw 'invalid-stats'
			const [gc, gts, gcs, fg] = timeStats
			if (!isNumber(gc) || !isNumberArray(gts) || !isNumberArray(gcs) || !isNumber(fg))
				throw 'invalid-time-stats'
			if (dailyDetail) {
				const [m, dn, hm, a, g, gt, h, f] = dailyDetail
				if (
					m !== 'daily' ||
					!isNumber(dn) ||
					typeof hm !== 'boolean' ||
					typeof a !== 'string' ||
					a.length !== WORD_LENGTH ||
					!(g instanceof Array) ||
					g.some((ge) => typeof ge !== 'string' || ge.length !== WORD_LENGTH) ||
					!isNumberArray(gt) ||
					h !== null ||
					typeof f !== 'boolean'
				)
					throw 'invalid-daily-detail'
			}
		} catch (e) {
			console.error(e)
			return false
		}
		return true
	}

	const statsProps: (keyof Stats)[] = [
		'currentStreak',
		'bestStreak',
		'totalGames',
		'wonGames',
		'distribution',
	]
	const serializeStats = (stats: Stats) => statsProps.map((p) => stats[p])

	const timeStatsProps: (keyof TimeStats)[] = [
		'gameCount',
		'guessTotals',
		'guessCounts',
		'fastestGame',
	]
	const serializeTimeStats = (timeStats: TimeStats) =>
		timeStatsProps.map((p) => timeStats[p])

	const gameDetailProps: (keyof GameDetail)[] = [
		'mode',
		'dayNumber',
		'hardMode',
		'answer',
		'guesses',
		'guessTimes',
		'hash',
		'fastest',
	]
	const serializeGameDetail = (detail: GameDetail | null) =>
		detail === null ? null : gameDetailProps.map((p) => detail[p])

	const deserializeFromPropList = (values: unknown[], props: string[]) =>
		Object.fromEntries(values.map((value, i) => [props[i], value]))

	function generateExportText() {
		return JSON.stringify([
			STORE_VERSION,
			get(store.lastPlayedDaily),
			serializeStats(get(store.stats)),
			serializeTimeStats(get(store.timeStats)),
			serializeGameDetail(get(store.lastDailyDetail)),
		])
	}

	function importStats(importText: string) {
		const [_ver, lastDaily, stats, timeStats, dailyDetail] = JSON.parse(importText)
		store.lastPlayedDaily.set(lastDaily)
		store.stats.set(deserializeFromPropList(stats, statsProps) as Stats)
		store.timeStats.set(deserializeFromPropList(timeStats, timeStatsProps) as TimeStats)
		if (dailyDetail !== null) {
			store.lastDailyDetail.set(
				deserializeFromPropList(dailyDetail, gameDetailProps) as GameDetail
			)
		}
		toast.push(get(t)('main.messages.stats_imported'), toastTheme)
		goto(`${base}/`)
	}
</script>

<script lang="ts">
	let mode: 'import' | 'export' | null = null
	let importText: string

	$: importTextIsValid = validateImportText(importText)
	let exportText = ''

	function onCopyClick() {
		toast.push(get(t)('main.messages.stats_copied'), toastTheme)
		copyText(exportText).then(
			() => toast.push('Stats copied!', toastTheme),
			() => toast.push(get(t)('main.messages.could_not_do'), toastTheme)
		)
	}

	onMount(() => (exportText = generateExportText()))
</script>

<section>
	<h1>Word Peaks</h1>
	<p style:margin-bottom="1.5rem">Back up and restore your Word Peaks stats</p>
	<div class="mode-buttons">
		<button
			class:active={mode === 'import'}
			on:click={() => (mode = mode === 'import' ? null : 'import')}
		>
			{$t('main.stats.import_stats')}
		</button>
		<button
			class:active={mode === 'export'}
			on:click={() => (mode = mode === 'export' ? null : 'export')}
		>
			{$t('main.stats.export_stats')}
		</button>
	</div>
	{#if mode === 'import'}
		<div class="info">
			<p>{@html $t('main.stats.import_info_1')}</p>
			<p>{$t('main.stats.import_info_2')}</p>
			<p>{$t('main.stats.import_info_3')}</p>
		</div>
		<label for="import_text">
			{#if !importText}
				{$t('main.stats.paste_your_stats')}
			{:else if importTextIsValid}
				✅ {$t('main.stats.ready_to_import')}
			{:else}
				❌ {$t('main.stats.invalid_stats')}
			{/if}
		</label>
		<textarea id="import_text" name="import_text" rows="4" bind:value={importText} />
		<button
			class="import-button"
			on:click={() => importStats(importText)}
			disabled={!importTextIsValid}>Import</button
		>
	{/if}
	{#if mode === 'export'}
		<label for="export_text">
			{$t('main.stats.export_instructions')}:
		</label>
		<textarea id="export_text" name="export_text" rows="4" value={exportText} readonly />
		<button style:align-self="flex-start" on:click={onCopyClick}>Copy</button>
	{/if}
	<a style:margin-top="3rem" style:text-align="center" href="{base}/">
		{$t('main.other.back')}
	</a>
</section>

<style>
	section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
	}
	button {
		border-radius: 0.5rem;
		border: 0;
		padding: 0 1.5rem;
		height: 3.5rem;
		font-size: 1.25em;
		font-weight: 700;
		background: var(--primary-color);
	}
	button:hover {
		background: var(--secondary-color);
	}
	button.active {
		background: var(--cta-color);
	}
	.mode-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}
	.mode-buttons button {
		height: 4rem;
		font-size: 1.375em;
	}
	.info {
		background: var(--secondary-color);
		padding: 1rem 1.5rem;
		border-radius: 1rem;
		margin-bottom: 1.5rem;
	}
	p {
		margin: 0.5rem 0;
	}
	label {
		margin-bottom: 0.5rem;
	}
	textarea {
		box-sizing: border-box;
		margin-bottom: 0.75rem;
		word-wrap: break-word;
		word-break: break-all;
	}
	.import-button {
		align-self: flex-start;
		background: #04883b;
	}
	.import-button:disabled {
		color: #ccc8;
		background: var(--secondary-color);
		cursor: default;
	}
	.import-button:not(:disabled):hover {
		background: var(--correct-color);
	}
</style>
