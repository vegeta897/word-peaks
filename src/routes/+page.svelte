<script lang="ts">
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import Board from '$com/Board.svelte'
	import Controls from '$com/Controls.svelte'
	import Stats from '$com/Stats.svelte'
	import Tutorial from '$com/Tutorial.svelte'
	import Options from '$com/Options.svelte'
	import { decodeWord, playDaily, playRandom } from '$lib/data-model'
	import * as store from '$src/store'
	import { browser } from '$app/environment'
	// TODO: Change to app/state when migrating to svelte 5
	import { page } from '$app/stores'
	import Footer from '$com/Footer.svelte'
	import Header from '$com/Header.svelte'
	import { initGameState } from '$src/store'
	// import Promo from '$com/Promo.svelte'

	// Hello! Sorry you had to look at my code

	const { openScreen, gameMode } = store

	const wordFromHash = decodeWord(get(page).url.hash?.slice(1))

	onMount(() => {
		if (!get(store.answerDaily) && !get(store.answerRandom)) {
			store.newUser.set(true)
			openScreen.set('tutorial')
		}
		if (!wordFromHash) {
			playDaily()
		} else {
			playRandom(wordFromHash)
		}
	})

	initGameState()

	let consoleMode: boolean
	if (browser) window.wp_start = () => (consoleMode = true)
</script>

<div class:minimized={$openScreen !== null}>
	<section>
		<Header />
		<Board />
		<!-- <Promo /> -->
		<Controls />
		{#if consoleMode}
			{#await import('$com/Console.svelte') then c}
				<svelte:component this={c.default} />
			{/await}
		{/if}
	</section>
	<Footer />
</div>
{#if $openScreen === 'options'}
	<Options />
{:else if $openScreen === 'tutorial'}
	<Tutorial />
{:else if $openScreen === 'stats'}
	<Stats gameMode={$gameMode} />
{/if}

<style>
	.minimized {
		height: 0;
		overflow: clip;
	}
</style>
