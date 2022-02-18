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
	import { alphabet, createNewBoard, ROWS } from '$lib/data-model'
	import { toast } from '@zerodevx/svelte-toast'

	let answer: string
	let boardContent
	let boardCommitted
	let currentRow: number
	let currentTile: number
	let correctLetter: string
	let invalidLetters: Set<string>
	let gameFinished: boolean
	let gameWon: boolean

	function newWord() {
		toast.pop()
		close()
		answer = targets[Math.floor(Math.random() * targets.length)]
		boardContent = createNewBoard()
		currentRow = 0
		currentTile = 0
		correctLetter = ''
		invalidLetters = new Set()
		gameFinished = false
		gameWon = false
		console.log(answer)
	}

	newWord()

	const showError = (m) => {
		toast.pop()
		toast.push(m, { theme: { '--toastBackground': 'var(--error-color)' } })
	}

	function typeLetter(letter: string) {
		if (gameFinished) {
			showResults()
			return
		}
		if (currentTile === boardContent[currentRow].length) return
		boardContent[currentRow][currentTile].letter = letter
		boardContent = boardContent
		currentTile++
		updateLetterLists()
	}

	function undoLetter() {
		if (gameFinished) {
			showResults()
			return
		}
		if (currentTile < 1) return
		currentTile--
		boardContent[currentRow][currentTile].letter = ''
		updateLetterLists()
	}

	function submitRow() {
		if (gameFinished) {
			showResults()
			return
		}
		if (currentTile < boardContent[currentRow].length) {
			showError('Not enough letters')
			return
		}
		const rowWord = boardContent[currentRow].map((t) => t.letter).join('')
		if (dictionary.includes(rowWord)) {
			let correctLetters = 0
			boardContent[currentRow].forEach((t) => {
				t.scored = true
				t.distance = alphabet.indexOf(t.letter) - alphabet.indexOf(answer[t.id])
				t.polarity = t.distance > 0 ? 1 : -1
				if (currentRow === 0) {
					t.magnitude = ROWS
				} else {
					const prevTile = boardContent[currentRow - 1][t.id]
					if (prevTile.polarity !== t.polarity) {
						t.magnitude = ROWS
					} else if (Math.abs(t.distance) > Math.abs(prevTile.distance)) {
						t.magnitude = prevTile.magnitude + 1
					} else if (Math.abs(t.distance) < Math.abs(prevTile.distance)) {
						t.magnitude = prevTile.magnitude - 1
					} else if (t.distance === prevTile.distance) {
						t.magnitude = prevTile.magnitude
					}
				}
				if (t.distance === 0) {
					t.magnitude = 0
					t.polarity = 0
					correctLetters++
				}
			})
			boardContent = boardContent
			currentRow++
			currentTile = 0
			boardCommitted = boardContent.slice(0, currentRow)
			if (correctLetters === 5) {
				gameWon = true
				gameFinished = true
			} else if (currentRow === ROWS) {
				gameFinished = true
			}
			if (gameFinished) {
				setTimeout(() => showResults(), 1500)
			} else {
				updateLetterLists()
			}
		} else {
			showError('Not a valid word')
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
				if (tile.distance === 0 && letter !== tile.letter) {
					invalidLetters.add(letter)
				}
				if (tile.distance < 0 && letter <= tile.letter) {
					invalidLetters.add(letter)
				}
				if (tile.distance > 0 && letter >= tile.letter) {
					invalidLetters.add(letter)
				}
			}
		})
		if (invalidLetters.size === alphabet.length - 1) {
			// One non-invalid letter remains
			correctLetter = alphabet.find((letter) => !invalidLetters.has(letter))
		}
	}

	function showResults() {
		open(Results, { gameFinished, gameWon, boardContent, newWord, answer })
	}
</script>

<section>
	<h1>Wordle Peaks</h1>
	<Board
		{currentRow}
		{currentTile}
		{correctLetter}
		{invalidLetters}
		{boardContent}
		{boardCommitted}
		{gameFinished}
	/>
	<Keyboard {typeLetter} {submitRow} {undoLetter} {correctLetter} {invalidLetters} />
</section>

<style>
	section {
		margin: 0;
		padding: 0;
	}

	h1 {
		width: 100%;
		margin: 1rem 0;
	}
</style>
