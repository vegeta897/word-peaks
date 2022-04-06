import { alphabet, pickRandom } from '$lib/data-model'
import type { MultipartAnimation } from '$lib/idle-animations'
import {
	dance,
	danceEnd,
	danceStart,
	groove,
	grooveEnd,
	grooveStart,
	hopIn,
	hopOut,
	peek,
	spinJump,
	unPeek,
} from '$lib/idle-animations'

const schedules: Map<string, number> = new Map()
let idlers: number

export function initScheduler(_idlers: number) {
	schedules.forEach((timeout) => clearTimeout(timeout))
	schedules.clear()
	idlers = _idlers
}

export type IdleSchedule = {
	letter: string
	animations: { animation: MultipartAnimation; endDelay?: number; iterations?: number }[]
}

// Avoid letters that don't look as good for the first idler
const firstLetterAlphabet = alphabet.filter((l) => !['l', 'i'].includes(l))

export function getSchedule(id: string): Promise<IdleSchedule> {
	let scheduleDelay = 0
	const firstIdler = schedules.size === 0
	const letter = pickRandom(firstIdler ? firstLetterAlphabet : alphabet)
	const schedule: IdleSchedule = { letter, animations: [] }
	if (!firstIdler) {
		scheduleDelay = randomFloat(20 * 1000, idlers * 8 * 1000)
	}
	const peekEndDelay = firstIdler ? 1200 : randomFloat(0, 600)
	schedule.animations.push({ animation: peek, endDelay: peekEndDelay })
	if (firstIdler || Math.random() < 0.95) {
		if (firstIdler) {
			// Shy at first
			schedule.animations.push({ animation: unPeek, endDelay: randomInt(2, 6) * 1000 })
			schedule.animations.push({ animation: peek, endDelay: peekEndDelay })
			schedule.animations.push({ animation: hopIn, endDelay: randomFloat(1000, 2000) })
			addDance(schedule.animations, randomInt(2, 3))
			addSpinJump(schedule.animations, randomInt(2, 3))
		} else {
			// Hop in and perform
			schedule.animations.push({ animation: hopIn, endDelay: randomFloat(400, 2000) })
			let performances = randomInt(0, 2)
			if (Math.random() > 0.8) performances++
			while (performances > 0) {
				pickRandom([
					() => addDance(schedule.animations, randomInt(1, 4)),
					() => addGroove(schedule.animations, randomInt(1, 4)),
					() => addSpinJump(schedule.animations, randomInt(1, 4)),
				])()
				performances--
			}
		}
		schedule.animations.push({ animation: hopOut })
	} else if (Math.random() < 0.5) {
		// Hop on by
		schedule.animations.push({ animation: hopIn })
		schedule.animations.push({ animation: hopOut })
	} else {
		// Changed your mind
		schedule.animations.push({ animation: unPeek })
	}
	return new Promise((resolve) => {
		schedules.set(
			id,
			window.setTimeout(() => resolve(schedule), scheduleDelay)
		)
	})
}

const addDance = (animations: IdleSchedule['animations'], iterations: number) => {
	animations.push({ animation: danceStart })
	animations.push({ animation: dance, iterations })
	animations.push({ animation: danceEnd, endDelay: randomFloat(300, 1000) })
}
const addGroove = (animations: IdleSchedule['animations'], iterations: number) => {
	animations.push({ animation: grooveStart })
	animations.push({ animation: groove, iterations })
	animations.push({ animation: grooveEnd, endDelay: randomFloat(300, 1000) })
}
const addSpinJump = (animations: IdleSchedule['animations'], iterations: number) => {
	animations.push({
		animation: spinJump,
		iterations,
		endDelay: randomFloat(300, 1000),
	})
}

const randomFloat = (min: number, max: number): number => min + Math.random() * (max - min)
const randomInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min
