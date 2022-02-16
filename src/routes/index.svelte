<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import dictionary from '$lib/data/dictionary-filtered.json'
	import targets from '$lib/data/targets-filtered.json'
	import Board from '$lib/board.svelte'
	import Keyboard from '$lib/keyboard.svelte'
	import { alphabet, createNewBoard } from '$lib/data-model'

	let answer = targets[Math.floor(Math.random() * targets.length)]
	let boardContent = createNewBoard()
	let currentRow = 0
	let currentTile = 0
	let error = null
	let correctLetter = ''
	let invalidLetters = new Set()

	console.log(answer)

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
			boardContent[currentRow].forEach((t, i) => {
				t.scored = true
				t.direction = t.letter > answer[i] ? 1 : -1
				if (t.letter === answer[i]) t.direction = 0
			})
			boardContent = boardContent
			currentRow++
			currentTile = 0
			updateLetterLists()
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}
</style>
