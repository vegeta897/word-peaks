export const AnimationParts = ['translateX', 'translateY', 'rotate', 'scale'] as const
export type AnimationPart = typeof AnimationParts[number]

type AnimationDefinition = { duration: number } & Partial<Record<AnimationPart, Keyframe[]>>
export type MultipartAnimation = { duration: number } & Partial<Record<AnimationPart, Keyframe[]>>

export const peek = defineAnimation({
	duration: 600,
	translateX: [
		{ transform: 'translateX(0)', easing: 'ease-in-out' },
		{ transform: 'translateX(10px)' },
	],
	rotate: [{ transform: 'rotate(-4deg)', easing: 'ease-in-out' }, { transform: 'rotate(20deg)' }],
})
export const unPeek = defineAnimation({
	duration: 400,
	translateX: [
		{ transform: 'translateX(10px)', easing: 'ease-in-out' },
		{ transform: 'translateX(0)' },
	],
	rotate: [{ transform: 'rotate(20deg)', easing: 'ease-in-out' }, { transform: 'rotate(-4deg)' }],
})
export const hopIn = defineAnimation({
	duration: 700,
	translateX: [
		{ transform: 'translateX(10px)', offset: 0.4 },
		{ transform: 'translateX(40px)', offset: 0.8 },
	],
	translateY: [
		{ transform: 'translateY(0)', offset: 0.4, easing: 'ease-out' },
		{ transform: 'translateY(-10px)', offset: 0.6, easing: 'ease-in' },
		{ transform: 'translateY(0)', offset: 0.8 },
	],
	rotate: [
		{ transform: 'rotate(20deg)', offset: 0.4 },
		{ transform: 'rotate(0)', offset: 0.8 },
	],
	scale: [
		{ easing: 'ease-out' },
		{ transform: 'scaleY(0.8)', offset: 0.3, easing: 'ease-out' },
		{ transform: 'scaleY(1.2)', offset: 0.5 },
		{ transform: 'scaleY(1)', offset: 0.6 },
		{ transform: 'scaleY(1)', offset: 0.8, easing: 'ease-out' },
		{ transform: 'scaleY(0.85)', offset: 0.9, easing: 'ease-in' },
		{ transform: 'scaleY(1)', offset: 1 },
	],
})
export const hopOut = defineAnimation({
	duration: 700,
	translateX: [
		{ transform: 'translateX(40px)', offset: 0.4 },
		{ transform: 'translateX(81px)', offset: 0.8 },
	],
	translateY: [
		{ transform: 'translateY(0)', offset: 0.4, easing: 'ease-out' },
		{ transform: 'translateY(-10px)', offset: 0.6, easing: 'ease-in' },
		{ transform: 'translateY(0)', offset: 0.8 },
	],
	rotate: [
		{ transform: 'skew(0)', offset: 0, easing: 'ease-out' },
		{ transform: 'skew(-20deg)', offset: 0.4 },
		{ transform: 'skew(-4deg)', offset: 0.8 },
	],
	scale: [
		{ easing: 'ease-out' },
		{ transform: 'scaleY(0.8)', offset: 0.3, easing: 'ease-out' },
		{ transform: 'scaleY(1.2)', offset: 0.5 },
		{ transform: 'scaleY(1)', offset: 0.6 },
		{ transform: 'scaleY(1)', offset: 0.8, easing: 'ease-out' },
		{ transform: 'scaleY(0.85)', offset: 0.9, easing: 'ease-in' },
		{ transform: 'scaleY(1)', offset: 1 },
	],
})
export const danceStart = defineAnimation({
	duration: 350,
	translateX: [{ transform: 'translateX(40px)' }],
	rotate: [{ transform: 'skew(0)', easing: 'ease-in-out' }, { transform: 'skew(6deg)' }],
	scale: [{ transform: 'scaleY(1)', easing: 'ease-in-out' }, { transform: 'scaleY(1.1)' }],
})
export const dance = defineAnimation({
	duration: 1000,
	translateX: [{ transform: 'translateX(40px)' }],
	rotate: [
		{ transform: 'skew(6deg)', easing: 'ease-in' },
		{ transform: 'skew(0)', easing: 'ease-out' },
		{ transform: 'skew(-6deg)', easing: 'ease-in' },
		{ transform: 'skew(0)', easing: 'ease-out' },
		{ transform: 'skew(6deg)' },
	],
	scale: [
		{ transform: 'scaleY(1.1)', easing: 'ease-in' },
		{ transform: 'scaleY(0.8)', easing: 'ease-out' },
		{ transform: 'scaleY(1.1)', easing: 'ease-in' },
		{ transform: 'scaleY(0.8)', easing: 'ease-out' },
		{ transform: 'scaleY(1.1)' },
	],
})
export const danceEnd = defineAnimation({
	duration: 300,
	translateX: [{ transform: 'translateX(40px)' }],
	rotate: [{ transform: 'skew(6deg)', easing: 'ease-in-out' }, { transform: 'skew(0)' }],
	scale: [{ transform: 'scaleY(1.1)', easing: 'ease-in-out' }, { transform: 'scaleY(1)' }],
})
export const spinJump = defineAnimation({
	duration: 800,
	translateX: [{ transform: 'translateX(40px)' }],
	translateY: [
		{ transform: 'translateY(0)' },
		{ transform: 'translateY(0)', offset: 0.4, easing: 'ease-out' },
		{ transform: 'translateY(-10px)', easing: 'ease-in', offset: 0.7 },
		{ transform: 'translateY(0)' },
	],
	scale: [
		{ transform: 'scaleY(1)', easing: 'ease-in-out' },
		{ transform: 'scaleY(0.8)', easing: 'ease-out', offset: 0.4 },
		{ transform: 'scaleY(1)', offset: 0.45 },
	],
	rotate: [
		{ transform: 'rotate3d(0,1,0,0)', offset: 0.4 },
		{ transform: 'rotate3d(0,1,0,180deg)', offset: 0.7 },
		{ transform: 'rotate3d(0,1,0,0)' },
	],
})
export const grooveStart = defineAnimation({
	duration: 600,
	translateX: [
		{ transform: 'translateX(40px)' },
		{ transform: 'translateX(40px)', offset: 0.08, easing: 'ease-out' },
		{ transform: 'translateX(35px)', offset: 0.5 },
	],
	rotate: [
		{ transform: 'skew(0)', easing: 'ease-in-out' },
		{ transform: 'skew(-12deg)', easing: 'ease-in-out' },
		{ transform: 'skew(0)' },
	],
	scale: [
		{ transform: 'scaleY(1)', easing: 'ease-in-out' },
		{ transform: 'scaleY(0.9)', easing: 'ease-in-out' },
		{ transform: 'scaleY(1)' },
	],
})
export const groove = defineAnimation({
	duration: 1200,
	translateX: [
		{ transform: 'translateX(35px)', offset: 0.08, easing: 'ease-out' },
		{ transform: 'translateX(45px)', offset: 0.25 },
		{ transform: 'translateX(45px)', offset: 0.58, easing: 'ease-out' },
		{ transform: 'translateX(35px)', offset: 0.75 },
	],
	rotate: [
		{ transform: 'skew(0)', offset: 0, easing: 'ease-in-out' },
		{ transform: 'skew(20deg)', offset: 0.25, easing: 'ease-in-out' },
		{ transform: 'skew(0)', offset: 0.5, easing: 'ease-in-out' },
		{ transform: 'skew(-20deg)', offset: 0.75, easing: 'ease-in-out' },
		{ transform: 'skew(0)', offset: 1 },
	],
	scale: [
		{ transform: 'scaleY(1)', offset: 0, easing: 'ease-in-out' },
		{ transform: 'scaleY(0.8)', offset: 0.25, easing: 'ease-in-out' },
		{ transform: 'scaleY(1)', offset: 0.5, easing: 'ease-in-out' },
		{ transform: 'scaleY(0.8)', offset: 0.75, easing: 'ease-in-out' },
		{ transform: 'scaleY(1)', offset: 1 },
	],
})
export const grooveEnd = defineAnimation({
	duration: 600,
	translateX: [
		{ transform: 'translateX(35px)', offset: 0.08, easing: 'ease-out' },
		{ transform: 'translateX(40px)', offset: 0.5 },
	],
	rotate: [
		{ transform: 'skew(0)', easing: 'ease-in-out' },
		{ transform: 'skew(12deg)', easing: 'ease-in-out' },
		{ transform: 'skew(0)' },
	],
	scale: [
		{ transform: 'scaleY(1)', easing: 'ease-in-out' },
		{ transform: 'scaleY(0.9)', easing: 'ease-in-out' },
		{ transform: 'scaleY(1)' },
	],
})

function defineAnimation(definition: AnimationDefinition): MultipartAnimation {
	const animation = definition
	for (const part of AnimationParts) {
		const partKeyframes = animation[part]
		if (partKeyframes) {
			const firstFrame = partKeyframes[0]
			if (firstFrame.offset && firstFrame.offset > 0)
				partKeyframes.unshift({ ...firstFrame, offset: 0 })
			const lastFrame = partKeyframes[partKeyframes.length - 1]
			if (lastFrame.offset && lastFrame.offset < 1) partKeyframes.push({ ...lastFrame, offset: 1 })
		}
	}
	return animation
}
