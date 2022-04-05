interface MultipartAnimation {
	translateX: Keyframe[]
	translateY?: Keyframe[]
	scale?: Keyframe[]
	rotate?: Keyframe[]
	duration: number
	endDelay: number
}

export const letterPeek: MultipartAnimation = {
	duration: 1000,
	endDelay: 1000,
	translateX: [{ easing: 'ease-in-out' }, { transform: 'translateX(10px)' }],
	rotate: [{ easing: 'ease-in-out' }, { transform: 'rotate(20deg)' }],
}

const centerX = 40

export const hopOut: Keyframe[] = [
	{ transform: `translateX(10px) rotate(20deg)`, easing: 'ease-out' },
	{ transform: `translateX(10px) rotate(20deg) scaleY(0.8)`, offset: 0.4, easing: 'ease-in' },
	{ transform: `translateX(10px) rotate(20deg) scaleY(1.2)`, offset: 0.5 },
	{ transform: `translate(20px,-7px) rotate(20deg) scaleY(1)` },
	{ transform: `translate(24px,-10px) rotate(10deg) scaleY(1)` },
	{ transform: `translate(28px,-7px) rotate(5deg) scaleY(1)` },
	{ transform: `translate(${centerX}px,0) rotate(0) scaleY(0.8)` },
	{ transform: `translate(${centerX}px,0) rotate(0) scaleY(1)` },
]
export const danceStart: Keyframe[] = [
	{ transform: `translate(${centerX}px,0) rotate(0) scaleY(1)`, easing: 'ease-in-out' },
	{ transform: `translate(${centerX}px,0) rotate(-3deg) scaleY(0.8)` },
]
export const dance: Keyframe[] = [
	{ transform: `translate(${centerX}px,0) rotate(-3deg) scaleY(0.8)`, easing: 'ease-out' },
	{ transform: `translate(${centerX}px,0) rotate(-6deg) scaleY(1.1)`, easing: 'ease-in' },
	{ transform: `translate(${centerX}px,0) rotate(3deg) scaleY(0.8)`, easing: 'ease-out' },
	{ transform: `translate(${centerX}px,0) rotate(6deg) scaleY(1.1)`, easing: 'ease-in' },
	{ transform: `translate(${centerX}px,0) rotate(-3deg) scaleY(0.8)` },
]
export const danceEnd: Keyframe[] = [
	{ transform: `translate(${centerX}px,0) rotate(-3deg) scaleY(0.8)`, easing: 'ease-out' },
	{ transform: `translate(${centerX}px,0) rotate(-6deg) scaleY(1.1)`, easing: 'ease-in-out' },
	{ transform: `translate(${centerX}px,0) rotate(0) scaleY(1)` },
]
export const spinJump: MultipartAnimation = {
	duration: 800,
	endDelay: 300,
	translateX: [{ transform: `translateX(${centerX}px)` }],
	translateY: [
		{ transform: `translateY(0)` },
		{ transform: `translateY(0)`, offset: 0.4, easing: 'ease-out' },
		{ transform: `translateY(-10px)`, easing: 'ease-in', offset: 0.7 },
		{ transform: `translateY(0)` },
	],
	scale: [
		{ transform: `scaleY(1)`, easing: 'ease-in-out' },
		{ transform: `scaleY(0.8)`, easing: 'ease-out', offset: 0.4 },
		{ transform: `scaleY(1)`, offset: 0.45 },
	],
	rotate: [
		{ transform: `rotate3d(0,1,0,0)`, offset: 0.4 },
		{ transform: `rotate3d(0,1,0,180deg)`, offset: 0.7 },
		{ transform: `rotate3d(0,1,0,0)` },
	],
}
