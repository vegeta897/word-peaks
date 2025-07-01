<script context="module" lang="ts">
	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 2

	const DURATION = 1500
	const FRAMES = 12

	const height = 8
	const radius = 6
	const tilt = 2 / 5 // Ratio of projected circle height to width
	const outlinePadding = 1.1

	function generateFaceFrames() {
		const frames: string[] = []
		for (let i = 0; i < FRAMES; i++) {
			const p1Radians = (i / FRAMES) * Math.PI * 2
			const p1x = radius * Math.cos(p1Radians)
			const p1y = radius * Math.sin(p1Radians) * tilt
			const p2Radians = (i / FRAMES + 1 / 4) * Math.PI * 2
			const p2x = radius * Math.cos(p2Radians)
			const p2y = radius * Math.sin(p2Radians) * tilt
			frames.push(`M0,${-height} L${p1x},${p1y} L${p2x},${p2y} Z`)
		}
		frames.push(frames[0]) // Loop back to first frame
		return frames
	}

	const faceFrames = generateFaceFrames()
	const faceIndexes = [0, 1, 2, 3]
	const topAndBottom = [
		['scale(-1 -1)', ['#ab387c', '#b82f7e'], [0.8, 0, 0, 0, 0, 1, 0.6, 0.8]],
		['', ['#ffffff', '#ffbfe4'], [1, 0.1, 0.2, 0.8, 0.1, 0, 0.1, 1]],
	] as const

	function generateOutlineFrames() {
		// Bad code with imperfect results, but good enough
		const frames: string[] = []
		const paddedRadius = radius * outlinePadding
		for (let i = 0; i < FRAMES / 4; i++) {
			const p1Radians = (i / FRAMES) * Math.PI * 2
			const p1x = paddedRadius * Math.cos(p1Radians)
			const p1y = paddedRadius * Math.sin(p1Radians) * tilt
			const p2Radians = (i / FRAMES + 1 / 4) * Math.PI * 2
			const p2x = paddedRadius * Math.cos(p2Radians)
			const p2y = paddedRadius * Math.sin(p2Radians) * tilt
			const p3Radians = (i / FRAMES + 2 / 4) * Math.PI * 2
			const p3x = paddedRadius * Math.cos(p3Radians)
			const p3y = paddedRadius * Math.sin(p3Radians) * tilt
			const p4Radians = (i / FRAMES + 3 / 4) * Math.PI * 2
			const p4x = paddedRadius * Math.cos(p4Radians)
			const p4y = paddedRadius * Math.sin(p4Radians) * tilt
			const p4yOfP1y = (height + p4y) / (height + p1y)
			const trX = p4x >= p1x * p4yOfP1y ? p4x : p1x * p4yOfP1y
			const trY = p4x >= p1x * p4yOfP1y ? p4y : p4y
			const p1yOfP4y = (height - p1y) / (height - p4y)
			const brX = p1x >= p4x * p1yOfP4y ? p1x : p4x * p1yOfP4y
			const brY = p1x >= p4x * p1yOfP4y ? p1y : p1y
			const p2yOfP3y = (height - p2y) / (height - p3y)
			const blX = p2x <= p3x * p2yOfP3y ? p2x : p3x * p2yOfP3y
			const blY = p2x <= p3x * p2yOfP3y ? p2y : p2y
			const p3yOfP2y = (height + p3y) / (height + p2y)
			const tlX = p3x <= p2x * p3yOfP2y ? p3x : p2x * p3yOfP2y
			const tlY = p3x <= p2x * p3yOfP2y ? p3y : p3y
			frames.push(
				`M0,${-height} L${trX},${trY} L${brX},${brY} L0,${height} L${blX},${blY} L${tlX},${tlY} Z`
			)
		}
		frames.push(
			`M0,${-height} L${paddedRadius},0 L${paddedRadius},0 L0,${height} L${-paddedRadius},0 L${-paddedRadius},0 Z`
		)
		return frames
	}

	const outlineFrames = generateOutlineFrames()
</script>

<script lang="ts">
	import { lastGameDetail, funStats } from '$src/store'

	export let x: number
	export let y: number

	$: originX = x - radius / 2
	$: originY = y - height / 1.2

	$: collected = $lastGameDetail?.dayNumber === $funStats.lastDayCollected

	export function collect(mouseX: number, mouseY: number) {
		console.log('collect!', mouseX, mouseY, x, y)
		return true
	}
</script>

<g style:position="relative" transform="translate({originX} {originY})">
	<g class="wobble">
		<linearGradient id="gemGradient" gradientTransform="rotate(90)">
			<stop offset="0" stop-color="#fff" />
			<stop offset="0.5" stop-color="var(--accent-color)" />
			<stop offset="1" stop-color="#ab387c" />
		</linearGradient>
		<path
			stroke-width={STROKE_HALF}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke="url(#gemGradient)"
			fill="var(--accent-color)"
			d={outlineFrames[0]}
		>
			<animate
				attributeName="d"
				dur="{DURATION / 4}ms"
				repeatCount="indefinite"
				values={outlineFrames.join(';')}
			/>
		</path>
		{#each faceIndexes as _, face}
			{#each topAndBottom as [transform, colors, opacityValues]}
				<path {transform} fill={colors[face % 2]}>
					<animate
						attributeName="d"
						dur="{DURATION}ms"
						begin="{(face * DURATION) / 4}ms"
						repeatCount="indefinite"
						values={faceFrames.join(';')}
					/>
					<animate
						attributeName="opacity"
						dur="{DURATION}ms"
						begin="{(face * DURATION) / 4}ms"
						repeatCount="indefinite"
						values={opacityValues.join(';')}
					/>
				</path>
			{/each}
		{/each}
	</g>
</g>

<style>
	.wobble {
		animation: wobble 1s infinite cubic-bezier(0.37, 0, 0.63, 1);
	}

	@keyframes wobble {
		0%,
		100% {
			transform: rotate(3deg);
		}
		50% {
			transform: rotate(-3deg);
		}
	}
</style>
