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
		VERSION,
		hasEnoughLetters,
	} from '$lib/data-model'
	import { toast } from '@zerodevx/svelte-toast'
	import type { SvelteToastOptions } from '@zerodevx/svelte-toast'
	import {
		answer,
		guesses,
		boardContent,
		currentRow,
		currentTile,
		gameFinished,
		validLetters,
		gameWon,
		gameMode,
		lastPlayedDaily,
		guessesRandom,
		answerRandom,
		guessesDaily,
		answerDaily,
		updateGuesses,
		stats,
		storeVersion,
		hardMode,
		lastPlayedDailyWasHard,
		lastPlayedRandomWasHard,
		invalidWord,
		notEnoughLetters,
		invalidHardModeGuess,
		openScreen,
		highContrast,
	} from '$lib/store'
	import { t } from '$lib/translations'
	import { trackEvent } from '$lib/plausible'
	import { browser } from '$app/env'
	import { page } from '$app/stores'
	import { OptionsIconPathData } from '$lib/icons'
	import Footer from '$lib/Footer.svelte'

	if (!get(storeVersion) || get(storeVersion) < VERSION) {
		storeVersion.set(VERSION)
		lastPlayedDaily.set(-1)
		answerDaily.set('')
		guessesDaily.set([])
	}

	let newUser: boolean

	onMount(async () => {
		if (!get(answerDaily) && !get(answerRandom)) {
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
			if (get(lastPlayedDaily) < getDayNumber()) playDaily()
		} else if (wordFromHash !== get(answerRandom)) {
			playRandom(wordFromHash)
		}
		if (get(gameFinished)) setTimeout(() => openScreen.set('results'), 1700)
	}

	function resetBoard() {
		toast.pop()
		boardContent.set(createNewBoard())
		currentTile.set(0)
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
		guessesRandom.set([])
		answerRandom.set(randomWord)
	}

	function playDaily() {
		history.pushState('', document.title, window.location.pathname + window.location.search) // Remove # from URL
		if (get(lastPlayedDaily) === getDayNumber()) {
			openScreen.set(null)
			return
		}
		resetBoard()
		guessesDaily.set([])
		const dayNumber = getDayNumber()
		lastPlayedDaily.set(dayNumber)
		answerDaily.set(getWordByDay(dayNumber))
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
		if (get(gameFinished)) {
			openScreen.set('results')
			return
		}
		const _currentTile = get(currentTile)
		if (_currentTile === WORD_LENGTH) return
		boardContent.update((content) => {
			const tile = content[get(currentRow)][_currentTile]
			const [lower, upper] = getValidLetterBounds(get(validLetters))
			tile.polarity = 0
			if (letter && letter < lower) {
				tile.polarity = -1
			} else if (letter && letter > upper) {
				tile.polarity = 1
			}
			tile.letter = letter
			return content
		})
		notEnoughLetters.set(false)
		if (letter || _currentTile < WORD_LENGTH - 1) currentTile.update((ct) => ct + 1)
	}

	function undoLetter(moveCaratBack = true) {
		if (get(gameFinished)) {
			openScreen.set('results')
			return
		}
		boardContent.update((content) => {
			let tile = content[get(currentRow)][get(currentTile)]
			if (moveCaratBack && get(currentTile) > 0 && !tile?.letter) {
				currentTile.update((ct) => ct - 1)
				tile = content[get(currentRow)][get(currentTile)]
			}
			tile.letter = ''
			tile.polarity = 0
			return content
		})
		invalidHardModeGuess.set(false)
		notEnoughLetters.set(false)
		invalidWord.set(false)
	}

	function moveCarat(dir: number) {
		if (get(gameFinished)) {
			openScreen.set('results')
			return
		}
		const moveTo = get(currentTile) + dir
		if (moveTo < 0 || moveTo >= WORD_LENGTH) return
		currentTile.update((ct) => ct + dir)
	}

	function submitRow() {
		if (get(gameFinished)) {
			openScreen.set('results')
			return
		}
		if (!hasEnoughLetters(get(boardContent), get(currentRow))) {
			notEnoughLetters.set(true)
			showError(get(t)('main.messages.not_enough_letters'), () => notEnoughLetters.set(false))
			return
		}
		const submittedRow = get(boardContent)[get(currentRow)]
		const submittedWord = getBoardRowString(submittedRow)
		if (submittedWord !== get(answer) && !dictionary.includes(submittedWord)) {
			invalidWord.set(true)
			showError(get(t)('main.messages.invalid_word'), () => invalidWord.set(false))
			return
		}
		if (
			get(hardMode) &&
			get(currentRow) > 0 &&
			submittedRow.some(
				(tile) => tile.letter < tile.letterBounds![0] || tile.letter > tile.letterBounds![1]
			)
		) {
			invalidHardModeGuess.set(true)
			showError(get(t)('main.messages.use_valid_letters'), () => invalidHardModeGuess.set(false))
			return
		}
		trackEvent('submitGuess')
		updateGuesses((words) => [...words, submittedWord])
		if (get(gameFinished)) {
			setTimeout(() => openScreen.set('results'), 1700)
			const won = get(gameWon)
			trackEvent(get(gameWon) ? 'gameWon' : 'gameLost')
			if (newUser) trackEvent('firstFinish')
			newUser = false
			;(get(gameMode) === 'daily' ? lastPlayedDailyWasHard : lastPlayedRandomWasHard).set(
				get(hardMode)
			)
			if (get(gameMode) === 'daily')
				stats.update((_stats) => {
					const streak = won ? _stats.currentStreak + 1 : 0
					const distribution = [..._stats.distribution]
					distribution[get(guesses).length - 1]++
					return {
						currentStreak: streak,
						bestStreak: streak > _stats.bestStreak ? streak : _stats.bestStreak,
						totalGames: _stats.totalGames + 1,
						wonGames: _stats.wonGames + (won ? 1 : 0),
						distribution,
					}
				})
		} else {
			currentTile.set(0)
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
			<header class:high-contrast={$highContrast}>
				<h1>Wordle Peaks</h1>
				<button class="test" on:click={() => openScreen.set('tutorial')}><span>?</span></button>
				<button on:click={() => openScreen.set('results')}>
					<svg viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
						<g transform="rotate(180 4.5 4.5)">
							<rect id="gr1" x="0" y="0" height="8" width="2" />
							<rect id="gr2" x="3" y="0" height="5" width="2" />
							<rect id="gr3" x="6" y="0" height="2" width="2" />
						</g>
					</svg>
				</button>
				<button class="hover-spin" on:click={() => openScreen.set('options')}>
					<svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
						<path d={OptionsIconPathData} />
					</svg>
				</button>
			</header>
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

	header {
		transition: width 400ms ease-in-out;
		margin: 0.6rem auto;
		padding: 0 8px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	h1 {
		text-align: left;
		margin: 0;
		flex-grow: 1;
	}

	header button {
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		padding: 0;
		width: 2.8rem;
		height: 2.8rem;
		margin-left: 0.6rem;
		border-radius: 8px;
		border: 0;
		font-weight: 700;
		font-size: 1.4em;
		color: #888;
		background-color: #ffffff0a;
		transition: background-color 100ms ease-out;
	}

	header button:hover {
		color: var(--text-color);
		background-color: var(--secondary-color);
	}

	header button svg {
		fill: #888;
	}
	header button:hover svg {
		fill: var(--text-color);
	}

	header button.test span {
		transition: font-size 150ms ease-in-out, transform 200ms ease-in-out 150ms;
	}

	header button.test:hover span {
		transform: scale(0.8);
		font-size: 150%;
	}

	#gr1,
	#gr3 {
		transition: transform 300ms ease-in-out;
	}

	header button:hover svg #gr1 {
		transform: scaleY(0.25);
	}

	header button:hover svg #gr3 {
		transform: scaleY(4);
	}

	header button.hover-spin svg {
		transition: transform 400ms ease-in-out;
	}
	header button.hover-spin:hover svg {
		transform: rotate(120deg);
	}

	.high-contrast button {
		background-color: var(--secondary-color);
	}

	@media (max-width: 360px) {
		h1 {
			font-size: 1.4em;
		}
	}
</style>
