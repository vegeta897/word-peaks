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
	import Options from '$lib/options.svelte'
	import {
		createNewBoard,
		getBoardRowString,
		getValidLetterBounds,
		WORD_LENGTH,
	} from '$lib/data-model'
	import { toast } from '@zerodevx/svelte-toast'
	import {
		answer,
		guesses,
		boardContent,
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
		<button on:click={() => open(Options)}>
			<svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<path
					d="M32.34 0c-3 0-4.83 2.59-5.41 5.67l-.82 4.26a30.24 30.24 0 0 0-6.64 3.84l-4.09-1.42c-2.68-.93-6.12-.75-7.62 1.85l-5.41 9.38c-1.5 2.59-.16 5.46 2.2 7.52l3.27 2.84a30.24 30.24 0 0 0-.26 3.85 30.24 30.24 0 0 0 .26 3.82l-3.28 2.84c-2.15 1.85-3.7 4.92-2.2 7.52l5.41 9.37c1.5 2.6 4.65 2.88 7.61 1.86l4.07-1.41a30.24 30.24 0 0 0 6.68 3.87l.82 4.26c.53 2.79 2.41 5.67 5.41 5.67h10.82c3 0 4.82-2.59 5.42-5.67l.81-4.22a30.24 30.24 0 0 0 6.74-3.88l4.07 1.4c2.85.99 6.11.75 7.61-1.85L73.23 52c1.5-2.6.17-5.48-2.21-7.53l-3.25-2.81a30.24 30.24 0 0 0 .26-3.87 30.24 30.24 0 0 0-.25-3.91l3.23-2.81c2.28-1.98 3.7-4.93 2.2-7.52l-5.41-9.38c-1.5-2.6-4.66-2.88-7.62-1.85l-4.07 1.42a30.24 30.24 0 0 0-6.72-3.87l-.81-4.2C48 2.71 46.16 0 43.16 0H32.34zm5.45 20.98a16.82 16.82 0 1 1 0 33.64 16.82 16.82 0 1 1 0-33.64z"
				/>
			</svg>
		</button>
	</header>
	<Board {showResults} />
	<Keyboard {typeLetter} {submitRow} {undoLetter} />
</section>

<style>
	header {
		width: 320px;
		transition: width 400ms ease-in-out;
		margin: 0.6rem auto;
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
		transition: background-color 150ms ease-out;
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

	@media (max-width: 480px) {
		header {
			width: 300px;
		}
	}
</style>
