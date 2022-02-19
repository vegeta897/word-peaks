<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import { getContext } from 'svelte'
	import { get } from 'svelte/store'
	const { open, close } = getContext('simple-modal')
	import dictionary from '$lib/data/dictionary-filtered.json'
	import targets from '$lib/data/targets-filtered.json'
	import Board from '$lib/board.svelte'
	import Keyboard from '$lib/keyboard.svelte'
	import Results from '$lib/results.svelte'
	import {
		createNewBoard,
		getBoardRowString,
		getValidLetterBounds,
		WORD_LENGTH,
	} from '$lib/data-model'
	import { toast } from '@zerodevx/svelte-toast'
	import {
		answer,
		boardContent,
		guesses,
		currentRow,
		currentTile,
		gameFinished,
		validLetters,
		gameWon,
	} from '$lib/store'

	const showResults = () =>
		open(Results, { newWord, answer: get(answer), guesses: get(guesses), gameWon: get(gameWon) })

	function newWord() {
		answer.set(targets[Math.floor(Math.random() * targets.length)])
		boardContent.set(createNewBoard())
		guesses.set([])
	}

	answer.subscribe(() => {
		toast.pop()
		close()
	})

	if (!get(answer)) newWord()

	gameFinished.subscribe((finished) => {
		if (finished) setTimeout(() => showResults(), 1700)
	})

	const showError = (m) => {
		toast.pop()
		toast.push(m, { theme: { '--toastBackground': 'var(--error-color)' } })
	}

	function typeLetter(letter: string) {
		if (get(gameFinished)) {
			showResults()
			return
		}
		if (get(currentTile) === WORD_LENGTH) return
		boardContent.update((content) => {
			const tile = content[get(currentRow)][get(currentTile)]
			const [lower, upper] = getValidLetterBounds(get(validLetters))
			tile.polarity = 0
			if (letter < lower) {
				tile.polarity = -1
			} else if (letter > upper) {
				tile.polarity = 1
			}
			tile.letter = letter
			return content
		})
	}

	function undoLetter() {
		if (get(gameFinished)) {
			showResults()
			return
		}
		if (get(currentTile) === 0) return
		boardContent.update((content) => {
			content[get(currentRow)][get(currentTile) - 1].letter = ''
			return content
		})
	}

	function submitRow() {
		if (get(gameFinished)) {
			showResults()
			return
		}
		if (get(currentTile) < WORD_LENGTH) {
			showError('Not enough letters')
			return
		}
		const submittedWord = getBoardRowString(get(boardContent)[get(currentRow)])
		if (!dictionary.includes(submittedWord)) {
			showError('Not a valid word')
			return
		}
		guesses.update((words) => [...words, submittedWord])
	}
</script>

<section>
	<h1 style="margin:1rem 0">Wordle Peaks</h1>
	<Board />
	<Keyboard {typeLetter} {submitRow} {undoLetter} />
</section>
