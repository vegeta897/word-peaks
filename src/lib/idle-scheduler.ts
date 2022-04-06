import { alphabet, pickRandom } from '$lib/data-model'
import type { MultipartAnimation } from '$lib/idle-animations'
import {
	dance,
	danceEnd,
	danceStart,
	dropIn,
	dropOut,
	groove,
	grooveEnd,
	grooveStart,
	hopIn,
	hopOut,
	peek,
	spinJump,
	unPeek,
} from '$lib/idle-animations'

const idlerIDs: Set<string> = new Set()
const animating: Set<string> = new Set()
let idlers: number
let scheduleBegin: number

export function initScheduler(_idlers: number) {
	idlerIDs.clear()
	animating.clear()
	idlers = _idlers
	scheduleBegin = Date.now()
}

export const startAnimation = (id: string) => animating.add(id)
export const stopAnimation = (id: string) => animating.delete(id)

export type IdleSchedule = {
	letter: string
	animations: { animation: MultipartAnimation; endDelay?: number; iterations?: number }[]
}

// Avoid letters that don't look as good for the first idler
const firstLetterAlphabet = alphabet.filter((l) => !['l', 'i'].includes(l))

export async function getSchedule(id: string): Promise<IdleSchedule | { wait: number }> {
	const firstIdler = idlerIDs.size === 0
	idlerIDs.add(id)
	// Only one idle animation for the first 20 seconds
	// One additional animation allowed every 30 seconds
	// Maximum animations is idler count divided by 3-6
	const maxAnimations = Math.min(
		idlers / randomInt(3, 6),
		((Date.now() - scheduleBegin) / 1000 - 20) / 30
	)
	if (!firstIdler && animating.size > maxAnimations)
		return { wait: randomFloat(5000, idlers * 2 * 1000) }
	const letter = pickRandom(firstIdler ? firstLetterAlphabet : alphabet)
	const schedule: IdleSchedule = { letter, animations: [] }
	if (firstIdler || Math.random() < 0.95) {
		if (firstIdler) {
			// Shy at first
			schedule.animations.push({ animation: peek, endDelay: randomFloat(1400, 2000) })
			schedule.animations.push({ animation: unPeek, endDelay: randomInt(2, 6) * 1000 })
			schedule.animations.push({ animation: peek, endDelay: randomFloat(1000, 1400) })
			schedule.animations.push({ animation: hopIn, endDelay: randomFloat(1000, 2000) })
			addDance(schedule.animations, randomInt(2, 3))
			addSpinJump(schedule.animations, randomInt(2, 3))
		} else {
			// Enter and perform
			if (Math.random() < 0.7) {
				schedule.animations.push({ animation: peek, endDelay: randomFloat(0, 600) })
				schedule.animations.push({ animation: hopIn, endDelay: randomFloat(400, 2000) })
			} else {
				schedule.animations.push({ animation: dropIn, endDelay: randomFloat(400, 2000) })
			}
			let performances = randomInt(0, 2)
			if (Math.random() > 0.9) performances++
			while (performances > 0) {
				pickRandom([
					() => addDance(schedule.animations, randomInt(1, 4)),
					() => addGroove(schedule.animations, randomInt(1, 4)),
					() => addSpinJump(schedule.animations, randomInt(1, 4)),
				])()
				performances--
			}
		}
		if (firstIdler || Math.random() < 0.7) {
			schedule.animations.push({ animation: hopOut })
		} else {
			schedule.animations.push({ animation: dropOut })
		}
	} else if (Math.random() < 0.4) {
		// Hop on by
		schedule.animations.push({ animation: peek, endDelay: randomFloat(50, 1500) })
		schedule.animations.push({ animation: hopIn })
		schedule.animations.push({ animation: hopOut })
	} else {
		// Changed your mind
		schedule.animations.push({ animation: peek, endDelay: randomFloat(50, 2200) })
		schedule.animations.push({ animation: unPeek })
	}
	return schedule
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
