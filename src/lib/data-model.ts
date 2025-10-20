import targetWords from '$lib/words/targets-filtered.json'
import { get } from 'svelte/store'
import { resetBoard, resetGuess } from './board'
import { randomElement } from './math'
import * as store from '$src/store'
import { ROWS, WORD_LENGTH, alphabet } from './constants'

let dictionary: string[] | undefined
export async function loadDictionary() {
	if (dictionary) return
	dictionary = (await import('$lib/words/dictionary-filtered.json')).default
}
export async function isValidWord(word: string): Promise<boolean> {
	if (!dictionary) await loadDictionary()
	return dictionary!.includes(word)
}

export type Tile = {
	id: number
	letter: string
	scored: boolean
	distance: number
	polarity: -1 | 0 | 1
	letterBounds?: [string, string]
}
export type Board = Tile[][]
export type GameMode = 'daily' | 'random'

export function playDaily() {
	store.gameMode.set('daily')
	history.pushState('', document.title, window.location.pathname + window.location.search) // Remove # from URL
	const dayNumber = getDayNumber()
	const dailyWord = getWordByDay(dayNumber)
	const newGame =
		get(store.lastPlayedDaily) !== getDayNumber() || get(store.answerDaily) !== dailyWord
	if (newGame) {
		resetBoard()
		store.guessesDaily.set([])
		store.lastPlayedDaily.set(dayNumber)
		store.answerDaily.set(dailyWord)
	}
	resetGuess()
	const gameFinished = get(store.gameFinished)
	store.showEndView.set(gameFinished)
	store.landscapeColor.set(gameFinished)
	store.landscapeNewGame.set(true)
	store.landscapeWideView.set(false)
}

export function playRandom(word?: string) {
	store.gameMode.set('random')
	const currentAnswer = get(store.answerRandom)
	const newGame = (word && word !== currentAnswer) || !currentAnswer
	const answer = newGame ? word || getRandomWord() : currentAnswer
	const hash = encodeWord(answer)
	history.pushState(
		'',
		document.title,
		window.location.pathname + `#${hash}` + window.location.search
	)
	if (newGame) {
		resetBoard()
		store.guessesRandom.set([])
		store.answerRandom.set(answer)
	}
	resetGuess()
	const gameFinished = get(store.gameFinished)
	store.showEndView.set(gameFinished)
	store.landscapeColor.set(gameFinished)
	store.landscapeNewGame.set(true)
	store.landscapeWideView.set(false)
}

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row: Tile[] = []
		board[i] = row
		for (let j = 0; j < WORD_LENGTH; j++) {
			row.push({ id: j, letter: '', scored: false, distance: 0, polarity: 0 })
		}
	}
	return board
}

export function scoreTile(letter: string, answer: string, tile: number): Tile {
	const distance = alphabet.indexOf(letter) - alphabet.indexOf(answer[tile])
	const polarity = distance === 0 ? 0 : distance > 0 ? 1 : -1
	return { id: tile, scored: true, distance, polarity, letter }
}

export function getValidLetters(
	boardContent: Board,
	row: number,
	tile: number
): Set<string> {
	if (tile === WORD_LENGTH) return new Set()
	const valid: Set<string> = new Set(alphabet)
	alphabet.forEach((letter) => {
		if (!valid.has(letter)) return // Already removed
		for (let i = 0; i < row; i++) {
			const prevTile = boardContent[i][tile]
			if (prevTile.distance === 0 && letter !== prevTile.letter) valid.delete(letter)
			if (prevTile.distance < 0 && letter <= prevTile.letter) valid.delete(letter)
			if (prevTile.distance > 0 && letter >= prevTile.letter) valid.delete(letter)
		}
	})
	return valid
}

export function getBoardRowString(row: Tile[]): string {
	return row.map((t) => t.letter).join('')
}

export function getValidLetterBounds(list: Set<string>): [string, string] {
	return [
		alphabet.find((letter) => list.has(letter))!,
		[...alphabet].reverse().find((letter) => list.has(letter))!,
	]
}

export function hasEnoughLetters(boardContent: Board, row: number): boolean {
	const letters = getBoardRowString(boardContent[row])
	return !(letters.length < WORD_LENGTH || letters.includes(' '))
}

const firstDay = new Date(2022, 1, 25) // 2022-02-25

export const getDayNumber = (): number => {
	let dayCount = 0
	const start = new Date(firstDay)
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	while (start < today) {
		dayCount++
		start.setDate(start.getDate() + 1)
	}
	return dayCount
}

export function getWordByDay(day: number): string {
	return targetWords[day % targetWords!.length]
}

export const getDayEnd = (day: number): Date => {
	const start = new Date(firstDay)
	let dayEnd = new Date(start)
	dayEnd.setDate(start.getDate() + day + 1)
	return dayEnd
}

export const getRandomWord = (): string => randomElement(targetWords)

export function encodeWord(word: string): string {
	let sum = 0
	for (const [l, letter] of [...word].entries()) {
		sum += alphabet.indexOf(letter) << (l * 5)
	}
	return sum.toString(36)
}

export function decodeWord(hash: string): false | string {
	if (!hash) return false
	let word = ''
	for (let i = 0; i < WORD_LENGTH; i++) {
		word += alphabet[(parseInt(hash, 36) & (0b11111 << (i * 5))) >> (i * 5)]
	}
	return word.length === 5 && word
}
