<script lang="ts">
	import { boardContent, currentRow, guesses, gameFinished, gameWon, answer } from '$src/store'
	import { get } from 'svelte/store'
	import { submitRow, typeLetter, undoLetter } from '$lib/board'

	function printBoard() {
		const board = get(boardContent)
		console.log(
			board
				.map((row) => {
					return row
						.map((tile) => {
							return `%c${tile.letter.toUpperCase() || ' '}`
						})
						.join('')
				})
				.join('%c\n'),
			...board
				.map((row) => [
					...row.map((tile) => {
						let tileColor = '#312236'
						let borderColor = '#5b505e'
						let borderCorners = ''
						if (tile.scored) {
							if (tile.distance === 0) {
								tileColor = '#15a850'
							} else if (tile.distance < 0) {
								tileColor = '#e38f2f'
								borderCorners = 'border-top-left-radius: 8px; border-top-right-radius: 8px;'
							} else {
								tileColor = '#567de8'
								borderCorners = 'border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'
							}
							borderColor = '#0000;'
						}
						return `font-size: 16px; display:inline-block; margin:2px; padding:1px 6px; background-color:${tileColor}; color:#eee; border: 1px solid ${borderColor}; border-radius: 2px; text-shadow: 1px 1px 1px #0004; ${borderCorners}`
					}),
					'',
				])
				.flat()
		)
	}

	function submitGuess(guess: string) {
		get(boardContent)
			[get(currentRow)].filter((t) => t.letter)
			.forEach(() => undoLetter())
		;[...guess].forEach((letter) => typeLetter(letter))
		submitRow()
	}

	console.log(
		'Welcome to %cWord Peaks %cconsole edition!',
		'font-weight:bold',
		'font-style: italic'
	)
	guesses.subscribe(() => {
		printBoard()
	})
	console.log('Use %cwp_guess("_____")%c to submit guesses', 'font-weight:bold', '')
	window.wp_guess = submitGuess

	gameFinished.subscribe((finished) => {
		if (!finished) return
		if (get(gameWon)) {
			console.log('%cYou won, %cnice job! 🎉', 'font-weight:bold', '')
		} else {
			console.log(
				`%cYou lost, %cthe answer was %c${get(answer).toUpperCase()}`,
				'font-weight:bold',
				'',
				'font-weight:bold'
			)
		}
	})
</script>
