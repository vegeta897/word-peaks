<script lang="ts">
	import { bezierEasing } from '$lib/transitions'

	const STROKE_WIDTH = 2
	const STROKE_HALF = STROKE_WIDTH / 2

	const DURATION = 4000

	const h = 12
	const w = 7
	const pw = w + 1

	const outline = [
		`M0,${-h} L${pw},0 L0,${h} L${-pw},0 Z`,
		`M0,${-h} L${w},0 L0,${h} L${-w},0 Z`,
		`M0,${-h} L${pw},0 L0,${h} L${-pw},0 Z`,
	]

	const topFaces = [
		`M0,${-h} L${w},0 L${w},0 Z`,
		`M0,${-h} L${-w},0 L${w},0 Z`,
		`M0,${-h} L${-w},0 L${-w},0 Z`,
		`M0,${-h} L${-w},0 L${w},0 Z`,
		`M0,${-h} L${w},0 L${w},0 Z`,
	]

	const bottomFaces = [
		`M0,${h} L${w},0 L${w},0 Z`,
		`M0,${h} L${-w},0 L${w},0 Z`,
		`M0,${h} L${-w},0 L${-w},0 Z`,
		`M0,${h} L${-w},0 L${w},0 Z`,
		`M0,${h} L${w},0 L${w},0 Z`,
	]

	const outlineStrokeFills = [
		[STROKE_WIDTH * 2, 'var(--tertiary-color)', 'none'],
		[STROKE_HALF, 'url(#gemGradient)', 'var(--accent-color)'],
	] as const
</script>

<linearGradient id="gemGradient" gradientTransform="rotate(90)">
	<stop offset="0" stop-color="#fff" />
	<stop offset="0.5" stop-color="var(--accent-color)" />
	<stop offset="1" stop-color="#ab387c" />
</linearGradient>
{#each outlineStrokeFills as [strokeWidth, stroke, fill]}
	<path
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		{stroke}
		{fill}
		d={outline[0]}
	>
		<animate
			attributeName="d"
			dur="{DURATION / 4}ms"
			begin="{DURATION / 8}ms"
			repeatCount="indefinite"
			calcMode="spline"
			keySplines="{bezierEasing.sineIn};{bezierEasing.sineOut}"
			values={outline.join(';')}
		/>
	</path>
{/each}
<!-- TODO: Attempt a 3D tilt, add 1/8th stages with dipped middle vertex -->
{#each [0, 1, 2, 3] as face}
	<path fill={face % 2 ? '#ffffff' : '#ffbfe4'} d="M0,{-h} L{w},0 L0,0 Z">
		<animate
			attributeName="d"
			dur="{DURATION}ms"
			begin="{(face * DURATION) / 4}ms"
			repeatCount="indefinite"
			values={topFaces.join(';')}
		/>
		<animate
			attributeName="opacity"
			dur="{DURATION}ms"
			begin="{(face * DURATION) / 4}ms"
			repeatCount="indefinite"
			values="0.5;1;0.1;0.3;0.2;0.1;0;0.3"
		/>
	</path>
	<path fill={face % 2 ? '#ab387c' : '#b82f7e'} d="M0,{h} L{-w},0 L0,0 Z">
		<animate
			attributeName="d"
			dur="{DURATION}ms"
			begin="{((face + 1) * DURATION) / 4}ms"
			repeatCount="indefinite"
			values={bottomFaces.join(';')}
		/>
		<animate
			attributeName="opacity"
			dur="{DURATION}ms"
			begin="{((face + 1) * DURATION) / 4}ms"
			repeatCount="indefinite"
			values="0;0.2;0.5;1;0.8;0.4;0;0.1"
		/>
	</path>
{/each}
