<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import dictionary from '../lib/data/dictionary-filtered.json'
	import targets from '../lib/data/targets-filtered.json'
	import Board from '../lib/board.svelte'
	import Keyboard from '../lib/keyboard.svelte'

	let answer = targets[Math.floor(Math.random() * targets.length)]
	let boardContent = new Array(6).fill(0).map(() => new Array(5).fill(''))
	console.log(boardContent)
	let currentRow = 0
	let currentTile = 0

	function typeLetter(letter: string) {
		if (currentTile === boardContent[currentRow].length) return
		boardContent[currentRow][currentTile] = letter
		boardContent = boardContent
		currentTile++
	}

	function undoLetter() {
		if (currentTile < 1) return
		currentTile--
		boardContent[currentRow][currentTile] = ''
	}

	function submitRow() {
		if (currentTile < boardContent[currentRow].length) return
		currentRow++
		currentTile = 0
	}
</script>

<section>
	<h1>Wordle Peaks</h1>
	The answer is
	<pre>{answer}</pre>
	<Board {boardContent} />
	<Keyboard {typeLetter} {submitRow} {undoLetter} />
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
