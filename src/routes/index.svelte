<script lang="ts">
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import dictionary from '$lib/data/dictionary-filtered.json'
	import Board from '$lib/Board.svelte'
	import Keyboard from '$lib/Keyboard.svelte'
	import Results from '$lib/Results.svelte'
	import Tutorial from '$lib/Tutorial.svelte'
	import Options from '$lib/Options.svelte'
	import {
		createNewBoard,
		getBoardRowString,
		getDayNumber,
		getWordByDay,
		getValidLetterBounds,
		WORD_LENGTH,
		decodeWord,
		encodeWord,
		getRandomWord,
		hasEnoughLetters,
	} from '$lib/data-model'
	import { toast } from '@zerodevx/svelte-toast'
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast'
	import * as store from '$src/store'
	import { t } from '$lib/translations'
	import { trackEvent } from '$lib/plausible'
	import { browser } from '$app/env'
	import { page } from '$app/stores'
	import Footer from '$lib/Footer.svelte'
	import Header from '$lib/Header.svelte'

	const { openScreen, gameMode } = store

	let newUser: boolean

	onMount(async () => {
		if (!get(store.answerDaily) && !get(store.answerRandom)) {
			newUser = true
			openScreen.set('tutorial')
		}
		startGame()
	})

	const hash = get(page).url.hash?.slice(1)
	const wordFromHash = decodeWord(hash)
	gameMode.set(wordFromHash ? 'random' : 'daily')

	function startGame() {
		if (!wordFromHash) {
			if (get(store.lastPlayedDaily) < getDayNumber()) playDaily()
		} else if (wordFromHash !== get(store.answerRandom)) {
			playRandom(wordFromHash)
		}
		if (get(store.gameFinished)) setTimeout(() => openScreen.set('results'), 1700)
	}

	function resetBoard() {
		toast.pop()
		store.boardContent.set(createNewBoard())
		store.currentTile.set(0)
	}

	function playRandom(word?: string) {
		const randomWord = word || getRandomWord()
		history.pushState(
			'',
			document.title,
			window.location.pathname + `#${encodeWord(randomWord)}` + window.location.search
		)
		// window.location.hash = encodeWord(randomWord)
		resetBoard()
		store.guessesRandom.set([])
		store.answerRandom.set(randomWord)
	}

	function playDaily() {
		history.pushState('', document.title, window.location.pathname + window.location.search) // Remove # from URL
		if (get(store.lastPlayedDaily) === getDayNumber()) {
			openScreen.set(null)
			return
		}
		resetBoard()
		store.guessesDaily.set([])
		const dayNumber = getDayNumber()
		store.lastPlayedDaily.set(dayNumber)
		store.answerDaily.set(getWordByDay(dayNumber))
	}

	// TODO: Move these functions to another file
	const showError = (m, onPop?: (id?: number) => any) => {
		toast.pop()
		const toastOptions: SvelteToastOptions = {
			theme: { '--toastBackground': 'var(--error-color)' },
		}
		if (onPop) toastOptions.onpop = onPop
		toast.push(m, toastOptions)
	}

	function typeLetter(letter: string) {
		if (get(store.gameFinished)) {
			openScreen.set('results')
			return
		}
		const _currentTile = get(store.currentTile)
		if (_currentTile === WORD_LENGTH) return
		store.boardContent.update((content) => {
			const tile = content[get(store.currentRow)][_currentTile]
			const [lower, upper] = getValidLetterBounds(get(store.validLetters))
			tile.polarity = 0
			if (letter && letter < lower) {
				tile.polarity = -1
			} else if (letter && letter > upper) {
				tile.polarity = 1
			}
			tile.letter = letter
			return content
		})
		store.notEnoughLetters.set(false)
		if (letter || _currentTile < WORD_LENGTH - 1) store.currentTile.update((ct) => ct + 1)
	}

	function undoLetter(moveCaratBack = true) {
		if (get(store.gameFinished)) {
			openScreen.set('results')
			return
		}
		store.boardContent.update((content) => {
			let tile = content[get(store.currentRow)][get(store.currentTile)]
			if (moveCaratBack && get(store.currentTile) > 0 && !tile?.letter) {
				store.currentTile.update((ct) => ct - 1)
				tile = content[get(store.currentRow)][get(store.currentTile)]
			}
			tile.letter = ''
			tile.polarity = 0
			return content
		})
		store.invalidHardModeGuess.set(false)
		store.notEnoughLetters.set(false)
		store.invalidWord.set(false)
	}

	function moveCarat(dir: number) {
		if (get(store.gameFinished)) {
			openScreen.set('results')
			return
		}
		const moveTo = get(store.currentTile) + dir
		if (moveTo < 0 || moveTo >= WORD_LENGTH) return
		store.currentTile.update((ct) => ct + dir)
	}

	function submitRow() {
		if (get(store.gameFinished)) {
			openScreen.set('results')
			return
		}
		if (!hasEnoughLetters(get(store.boardContent), get(store.currentRow))) {
			store.notEnoughLetters.set(true)
			showError(get(t)('main.messages.not_enough_letters'), () => store.notEnoughLetters.set(false))
			return
		}
		const submittedRow = get(store.boardContent)[get(store.currentRow)]
		const submittedWord = getBoardRowString(submittedRow)
		if (submittedWord !== get(store.answer) && !dictionary.includes(submittedWord)) {
			store.invalidWord.set(true)
			showError(get(t)('main.messages.invalid_word'), () => store.invalidWord.set(false))
			return
		}
		if (
			get(store.hardMode) &&
			get(store.currentRow) > 0 &&
			submittedRow.some(
				(tile) => tile.letter < tile.letterBounds![0] || tile.letter > tile.letterBounds![1]
			)
		) {
			store.invalidHardModeGuess.set(true)
			showError(get(t)('main.messages.use_valid_letters'), () =>
				store.invalidHardModeGuess.set(false)
			)
			return
		}
		trackEvent('submitGuess')
		store.updateGuesses((words) => [...words, submittedWord])
		if (get(store.gameFinished)) {
			setTimeout(() => openScreen.set('results'), 1700)
			const won = get(store.gameWon)
			trackEvent(won ? 'gameWon' : 'gameLost')
			if (newUser) trackEvent('firstFinish')
			newUser = false
			;(get(gameMode) === 'daily'
				? store.lastPlayedDailyWasHard
				: store.lastPlayedRandomWasHard
			).set(get(store.hardMode))
			if (get(gameMode) === 'daily')
				store.stats.update((_stats) => {
					const streak = won ? _stats.currentStreak + 1 : 0
					const distribution = [..._stats.distribution]
					distribution[get(store.guesses).length - 1]++
					return {
						currentStreak: streak,
						bestStreak: streak > _stats.bestStreak ? streak : _stats.bestStreak,
						totalGames: _stats.totalGames + 1,
						wonGames: _stats.wonGames + (won ? 1 : 0),
						distribution,
					}
				})
		} else {
			store.currentTile.set(0)
		}
	}

	let consoleMode: boolean
	if (browser)
		window.wp_start = () => {
			consoleMode = true
		}
</script>

<div>
	<div class:minimized={$openScreen !== null}>
		<section>
			<Header />
			<Board startCentered={newUser} />
			<Keyboard {typeLetter} {submitRow} {undoLetter} {moveCarat} />
			{#if consoleMode}
				{#await import('$lib/Console.svelte') then c}
					<svelte:component this={c.default} {typeLetter} {submitRow} {undoLetter} />
				{/await}
			{/if}
		</section>
		<Footer />
	</div>
	{#if $openScreen === 'options'}
		<Options />
	{:else if $openScreen === 'tutorial'}
		<Tutorial {newUser} />
	{:else if $openScreen === 'results'}
		<Results
			{hash}
			playDaily={() => {
				openScreen.set(null)
				gameMode.set('daily')
				playDaily()
			}}
			playRandom={() => {
				openScreen.set(null)
				gameMode.set('random')
				playRandom()
			}}
		/>
	{/if}
</div>

<style>
	.minimized {
		height: 0;
		overflow: clip;
	}
</style>
