<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import { getContext, onMount } from 'svelte'
	import { get } from 'svelte/store'
	const { open, close } = getContext('simple-modal')
	import dictionary from '$lib/data/dictionary-filtered.json'
	import targets from '$lib/data/targets-filtered.json'
	import Board from '$lib/board.svelte'
	import Keyboard from '$lib/keyboard.svelte'
	import Results from '$lib/results.svelte'
	import Tutorial from '$lib/tutorial.svelte'
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
		close()
		toast.pop()
		answer.set(targets[Math.floor(Math.random() * targets.length)])
		boardContent.set(createNewBoard())
		guesses.set([])
	}

	onMount(async () => {
		if (!get(answer)) {
			await setTimeout(() => {}) // Modal closes itself if we open too quickly
			open(Tutorial, {}, {}, { onClose: () => newWord() })
		}
	})

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
			const tile = content[get(currentRow)][get(currentTile) - 1]
			tile.letter = ''
			tile.distance = 0
			tile.polarity = 0
			tile.magnitude = 0
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
	<header class:wide={$guesses.length > 0}>
		<h1>Wordle Peaks</h1>
		<button on:click={() => open(Tutorial)}>?</button>
	</header>
	<Board />
	<Keyboard {typeLetter} {submitRow} {undoLetter} />
</section>

<style>
	header {
		width: 320px;
		transition: width 400ms ease-in-out;
		margin: 1rem auto;
		padding: 0 8px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	header.wide {
		width: 100%;
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
		padding: 0.3rem 0.7rem;
		border-radius: 4px;
		border: 0;
		font-weight: 700;
		font-size: 1.4em;
		background: none;
		color: #888;
	}

	header button:hover {
		color: var(--text-color);
		background-color: var(--secondary-color);
	}
</style>
