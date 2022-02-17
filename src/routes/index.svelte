<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import { getContext } from 'svelte'
	const { open, close } = getContext('simple-modal')
	import dictionary from '$lib/data/dictionary-filtered.json'
	import targets from '$lib/data/targets-filtered.json'
	import Board from '$lib/board.svelte'
	import Keyboard from '$lib/keyboard.svelte'
	import Results from '$lib/results.svelte'
	import { alphabet, createNewBoard } from '$lib/data-model'

	const ROWS = 6

	let answer: string
	let boardContent
	let currentRow: number
	let currentTile: number
	let error: null | string
	let correctLetter: string
	let invalidLetters: Set<string>

	function newWord() {
		close()
		answer = targets[Math.floor(Math.random() * targets.length)]
		boardContent = createNewBoard(ROWS)
		currentRow = 0
		currentTile = 0
		error = null
		correctLetter = ''
		invalidLetters = new Set()
		console.log(answer)
	}

	newWord()

	function typeLetter(letter: string) {
		if (currentTile === boardContent[currentRow].length) return
		boardContent[currentRow][currentTile].letter = letter
		boardContent = boardContent
		currentTile++
		updateLetterLists()
		error = null
	}

	function undoLetter() {
		if (currentTile < 1) return
		currentTile--
		boardContent[currentRow][currentTile].letter = ''
		updateLetterLists()
		error = null
	}

	function submitRow() {
		if (currentTile < boardContent[currentRow].length) {
			error = 'not enough letters'
			return
		}
		const rowWord = boardContent[currentRow].map((t) => t.letter).join('')
		if (dictionary.includes(rowWord)) {
			let correctLetters = 0
			boardContent[currentRow].forEach((t, i) => {
				t.scored = true
				t.direction = t.letter > answer[i] ? 1 : -1
				if (t.letter === answer[i]) {
					correctLetters++
					t.direction = 0
				}
			})
			boardContent = boardContent
			currentRow++
			currentTile = 0
			let gameFinished = false
			let gameWon = false
			if (correctLetters === 5) {
				gameFinished = true
				gameWon = true
			} else if (currentRow === ROWS) {
				gameFinished = true
			}
			if (gameFinished) {
				open(Results, { gameFinished, gameWon, boardContent, newWord })
			} else {
				updateLetterLists()
			}
		} else {
			error = 'invalid word'
		}
	}

	function updateLetterLists() {
		if (currentTile === boardContent[currentRow].length) {
			invalidLetters = new Set(alphabet)
			return
		}
		correctLetter = ''
		invalidLetters = new Set()
		if (currentRow === 0) return
		alphabet.forEach((letter) => {
			for (let i = 0; i < currentRow; i++) {
				const tile = boardContent[i][currentTile]
				if (tile.direction === 0) {
					if (letter === tile.letter) {
						correctLetter = letter
					} else {
						invalidLetters.add(letter)
					}
				}
				if (tile.direction < 0 && letter <= tile.letter) {
					invalidLetters.add(letter)
				}
				if (tile.direction > 0 && letter >= tile.letter) {
					invalidLetters.add(letter)
				}
			}
		})
	}
</script>

<section>
	<h1>Wordle Peaks</h1>
	{#if error}
		{error}
	{/if}
	<Board {boardContent} />
	<Keyboard {typeLetter} {submitRow} {undoLetter} {correctLetter} {invalidLetters} />
</section>

<style>
	section {
		margin: 0;
		padding: 0;
	}

	h1 {
		width: 100%;
		margin: 1.2rem 0;
	}
</style>
