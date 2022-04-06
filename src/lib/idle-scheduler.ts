import { alphabet, pickRandom } from '$lib/data-model'
import type { MultipartAnimation } from '$lib/idle-animations'
import { dance, danceEnd, danceStart, hopIn, hopOut, peek, spinJump } from '$lib/idle-animations'

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

export function getSchedule(id: string): Promise<IdleSchedule> {
	const schedule: IdleSchedule = { letter: pickRandom(alphabet), animations: [] }
	let scheduleDelay = 0
	const firstIdler = schedules.size === 0
	if (!firstIdler) {
		scheduleDelay = randomFloat(12 * 1000, idlers * 5 * 1000)
	}
	schedule.animations.push({ animation: peek, endDelay: randomFloat(200, 600) })
	if (firstIdler || Math.random() < 0.95) {
		// Hop in and perform
		schedule.animations.push({ animation: hopIn, endDelay: randomFloat(400, 2000) })
		if (firstIdler) {
			addDance(schedule.animations, randomInt(2, 4))
			addSpinJump(schedule.animations, randomInt(2, 3))
		} else {
			let performances = randomInt(0, 2)
			if (Math.random() > 0.8) performances++
			while (performances > 0) {
				addPerformance(schedule.animations)
				performances--
			}
		}
		schedule.animations.push({ animation: hopOut })
	} else {
		// Hop on by
		schedule.animations.push({ animation: hopIn })
		schedule.animations.push({ animation: hopOut })
	}
	return new Promise((resolve) => {
		schedules.set(
			id,
			window.setTimeout(() => resolve(schedule), scheduleDelay)
		)
	})
}

const addPerformance = (animations: IdleSchedule['animations']) => {
	pickRandom([
		() => addDance(animations, randomInt(1, 5)),
		() => addSpinJump(animations, randomInt(1, 4)),
	])()
}

const addDance = (animations: IdleSchedule['animations'], iterations: number) => {
	animations.push({ animation: danceStart })
	animations.push({ animation: dance, iterations })
	animations.push({ animation: danceEnd, endDelay: randomFloat(300, 1000) })
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
