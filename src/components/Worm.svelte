<script lang="ts" context="module">
	export const wormHolePositions = [
		[4, 15, 55],
		[1, 45, 55],
		[2, 30, 60],
		[0, 20, 55],
		[3, 40, 55],
		[4, 45, 55],
	]
	export const getWormHoleColor = (polarity: -1 | 0 | 1, highContrast: boolean) =>
		({
			[1]: '#344dcb',
			[0]: highContrast ? '#3d941c' : '#0d7e31',
			[-1]: highContrast ? '#ba275c' : '#c5611d',
		})[polarity]
</script>

<script lang="ts">
	import { sleep } from '$src/lib/math'
	import { currentRow, boardContent, highContrast, gameFinished } from '$src/store'
	import { onDestroy } from 'svelte'
	import { get } from 'svelte/store'

	const TILE_BORDER = 2

	let overlayWidth = 0
	let overlayHeight = 0
	let containerElement: HTMLDivElement
	let wormElements: SVGPathElement[] = []
	let wormHoles: [number, number, number][] = []
	let wormPaths: string[] = []
	let lastAnimatedRow = 0
	let displayRow = 0

	let tileSize: number
	let tileMargin: number
	$: borderRadius = (tileSize - TILE_BORDER * 8) * 0.14
	$: wormThickness = Math.round(tileSize * 0.3)
	$: wormLength = Math.round(overlayWidth / 3)

	const tilePos = (tile: number) =>
		(tileSize + tileMargin) * Math.floor(tile) + TILE_BORDER + (tile % 1) * tileSize

	function getTileBounds(
		fromRow: number,
		fromTile: number,
		rowSpan = 0,
		tileSpan = 0
	): [number, number, number, number] {
		const tileSizeWithMargin = tileSize + tileMargin
		return [
			tilePos(fromTile),
			tilePos(fromRow),
			tileSize + tileSpan * tileSizeWithMargin - TILE_BORDER * 2,
			tileSize + rowSpan * tileSizeWithMargin - TILE_BORDER * 2,
		]
	}

	onDestroy(
		currentRow.subscribe(async (row) => {
			if (row === lastAnimatedRow || get(gameFinished)) return
			lastAnimatedRow = row
			if (row > 5) return
			displayRow = row - 1
			await sleep(1500)
			displayRow = row
			wormElements[row]?.animate(
				[
					{
						strokeDashoffset: wormLength,
					},
					{
						strokeDashoffset: -wormPathLengths[row],
					},
				],
				{
					duration: wormPathLengths[row] * 3.5,
					easing: 'cubic-bezier(0.19, 0, 0.27, 0.16)',
				}
			)
		})
	)

	let clipRects: [x: number, y: number, width: number, height: number][][] = []

	function redrawClipPath() {
		clipRects = [
			[],
			[
				getTileBounds(0, 3, 1, 1),
				getTileBounds(2, 2, 1, 1),
				getTileBounds(3, 1),
				getTileBounds(4, 2, 1),
			],
			[
				getTileBounds(1, 1, 1),
				getTileBounds(2, 2, 0, 1),
				getTileBounds(2, 3, 2),
				getTileBounds(3, 2, 1),
				getTileBounds(3, 4, 1),
			],
			[
				getTileBounds(2, 2, 1),
				getTileBounds(3, 0, 1, 1),
				getTileBounds(4, 2, 0, 1),
				getTileBounds(4, 4),
				getTileBounds(5, 0),
				getTileBounds(5, 1, 0, 1),
				getTileBounds(5, 3, 0, 1),
			],
			[
				getTileBounds(3, 0, 1),
				getTileBounds(4, 1, 1),
				getTileBounds(4, 2, 1),
				getTileBounds(4, 3, 1),
				getTileBounds(5, 2, 0, 3),
			],
			[getTileBounds(4, 3, 1), getTileBounds(5, 0, 0, 4)],
		]
	}

	// Convert all values in template with tilePos()
	const tilePosTemplate = (strings: TemplateStringsArray, ...values: number[]) =>
		values.reduce(
			(str, value, i) => str + tilePos(value).toString() + strings[i + 1],
			strings[0]
		)

	const wormPathLengths = [0, 1000, 1300, 1400, 1300, 1700]

	function redrawWormPaths() {
		wormHoles = [
			[4, tilePos(4.3), tilePos(0.65)],
			[1, tilePos(1.6), tilePos(1.65)],
			[2, tilePos(2.45), tilePos(2.75)],
			[0, tilePos(0.35), tilePos(3.7)],
			[3, tilePos(3.55), tilePos(4.7)],
		]
		wormPaths = [
			'',
			`M${wormHoles[0][1]},${wormHoles[0][2]}` +
				tilePosTemplate`Q${3.7},${1.1} ${4.2},${1.6}` +
				tilePosTemplate`T${4.1},${2.4}` +
				tilePosTemplate`T${2.9},${2.4}` +
				tilePosTemplate`T${1.8},${2.3}` +
				tilePosTemplate`T${1.4},${3}` +
				tilePosTemplate`T${1.9},${3.5}` +
				tilePosTemplate`T${2.8},${3.6}` +
				tilePosTemplate`T${3.3},${4}` +
				tilePosTemplate`T${2.9},${4.6}` +
				tilePosTemplate`T${2.4},${6}`,
			`M${wormHoles[1][1]},${wormHoles[1][2]}` +
				tilePosTemplate`C${1.6},${2} ${1.9},${2.9} ${2.4},${2.75}` +
				tilePosTemplate`S${3.1},${2.7} ${3.2},${2.9}` +
				tilePosTemplate`S${3.2},${3.4} ${2.9},${3.5}` +
				tilePosTemplate`S${2.6},${4.2} ${2.9},${4.3}` +
				tilePosTemplate`S${3.3},${4.4} ${3.85},${4.35}` +
				tilePosTemplate`S${4.6},${3.6} ${5},${3.7}`,
			`M${wormHoles[2][1]},${wormHoles[2][2]}` +
				tilePosTemplate`C${2.4},${3.3} ${2.2},${3.8} ${1.4},${3.6}` +
				tilePosTemplate`S${-1},${3.2} ${-1},${3.99}` +
				tilePosTemplate`S${0},${4.7} ${0.5},${4.7}` +
				tilePosTemplate`S${1.4},${4.3} ${1.99},${4.3}` +
				tilePosTemplate`S${3.1},${4.9} ${3.8},${4.5}` +
				tilePosTemplate`S${6},${4.7} ${6},${5}` +
				tilePosTemplate`S${4.8},${5.9} ${4.1},${5.7}` +
				tilePosTemplate`S${2.8},${5.2} ${2},${5.2}` +
				tilePosTemplate`S${0.1},${5.5} ${0.3},${6}`,
			`M${wormHoles[3][1]},${wormHoles[3][2]}` +
				tilePosTemplate`C${0.35},${4} ${0.5},${4.75} ${1},${4.75}` +
				tilePosTemplate`S${1.5},${5.25} ${2},${5.25}` +
				tilePosTemplate`S${2.6},${4.7} ${3},${4.7}` +
				tilePosTemplate`S${3.4},${5.45} ${2.99},${5.5}` +
				tilePosTemplate`S${2.5},${6.5} ${3},${6.5}` +
				tilePosTemplate`S${3.6},${5.65} ${4},${5.65}` +
				tilePosTemplate`S${4.6},${5.8} ${4.6},${6.5}`,
			`M${wormHoles[4][1]},${wormHoles[4][2]}` +
				tilePosTemplate`C${3.55},${5.2} ${3.5},${5.7} ${2.5},${5.7}` +
				tilePosTemplate`S${-1},${5} ${-1},${5.5}` +
				tilePosTemplate`S${0.5},${7} ${0.5},${7}` +
				tilePosTemplate`S${0.5},${5.65} ${0.99},${5.65}` +
				tilePosTemplate`S${1.5},${7} ${1.5},${7}` +
				tilePosTemplate`S${1.5},${5.65} ${1.99},${5.65}` +
				tilePosTemplate`S${2.5},${7} ${2.5},${7}` +
				tilePosTemplate`S${2.5},${5.65} ${2.99},${5.65}` +
				tilePosTemplate`S${3.5},${7} ${3.5},${7}` +
				tilePosTemplate`S${3.5},${5.65} ${3.99},${5.65}` +
				tilePosTemplate`S${4.5},${7} ${4.5},${7}` +
				tilePosTemplate`S${4.5},${5.65} ${5},${5.65}`,
		]
	}

	$: if (overlayWidth) {
		if (containerElement) {
			const style = window.getComputedStyle(containerElement)
			tileSize = parseInt(style.getPropertyValue('--tile-size'))
			tileMargin = parseInt(style.getPropertyValue('--tile-margin'))
			redrawClipPath()
			redrawWormPaths()
		}
	}
</script>

<div
	class="april-fools-overlay"
	bind:this={containerElement}
	bind:clientWidth={overlayWidth}
	bind:clientHeight={overlayHeight}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 {overlayWidth} {overlayHeight}"
		width="100%"
		height="100%"
	>
		{#each wormHoles as [t, cx, cy], h}
			{#if displayRow > h}
				<circle
					class="worm-hole"
					fill={getWormHoleColor($boardContent[h][t].polarity, $highContrast)}
					{cx}
					{cy}
					r={(wormThickness / 2) * 1.2}
				></circle>
				<circle
					class="worm-hole-pop"
					fill="#fff"
					{cx}
					{cy}
					style:transform-origin="{cx}px
					{cy}px"
					r={(wormThickness / 2) * 1.2}
				></circle>
			{/if}
		{/each}
		{#each wormPaths as wormPath, w}
			{@const clips = clipRects[w] || []}
			<clipPath id="worm_clip_path_{w}">
				{#each clips as [x, y, width, height]}
					<rect {x} {y} {width} {height} rx={borderRadius} ry={borderRadius}></rect>
				{/each}
			</clipPath>
			<g clip-path="url(#worm_clip_path_{w})">
				<!-- Webkit needs this rectangle or the clipping edges are messed up -->
				<rect width={overlayWidth} height={overlayHeight} fill="none"></rect>
				<path
					bind:this={wormElements[w]}
					style:stroke-dasharray="{wormLength} 2000"
					style:stroke-dashoffset={wormLength}
					fill="none"
					stroke-width={wormThickness}
					stroke-linecap="round"
					stroke="var(--accent-color)"
					d={wormPath}
				></path>
			</g>
		{/each}
	</svg>
</div>

<style>
	.april-fools-overlay {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 2px;
		pointer-events: none;
	}

	.worm-hole {
		animation: from-black 1s ease-out backwards;
	}

	@keyframes from-black {
		0% {
			fill: #000e;
		}
	}

	.worm-hole-pop {
		animation: pop 250ms ease-out forwards;
	}

	@keyframes pop {
		100% {
			transform: scale(2);
			fill: #fff0;
		}
	}

	@media (max-width: 375px) {
		.april-fools-overlay {
			left: 1px;
		}
	}
</style>
