<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { Landscape } from '$lib/landscape'
	import { getLandscape } from '$lib/landscape'
	import Tree from './landscape/Tree.svelte'
	import Hill from './landscape/Hill.svelte'
	import Pond from './landscape/Pond.svelte'
	import { getDistance, type XY } from '$lib/math'
	import { tick } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const { landscapeForceColor } = store

	let initializing = true
	let svgElement: SVGElement
	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0
	let hide = false
	let animate = false
	let firstDraw = true
	let redraw = 0
	let seed = 0

	let landscape: Landscape = {
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
		rowsGenerated: 0,
		features: [],
		tileMap: new Map(),
		openTiles: new Map(),
		pondTiles: [],
		newPondTiles: [],
		nextID: 1,
		totalDelay: 0,
	}

	function updateDimensions(width: number, height: number) {
		console.log(width)
		// TODO: Aim for ideal tile count (width x height)
		// Enable mini if below ideal count
		const tileWidth = width < 130 ? 18 : width < 144 ? 21 : width < 316 ? 24 : 27
		const tileHeight = width < 130 ? 12 : width < 144 ? 14 : width < 316 ? 16 : 18
		const newWidth = Math.floor(width / tileWidth)
		const newHeight = Math.floor(height / tileHeight)
		if (newWidth === landscape.width && newHeight === landscape.height) return
		landscape.width = newWidth
		landscape.height = newHeight
		landscape.mini = landscape.width < 8 // TODO: Change to total tile count (width x height)
		landscape.centerX = Math.floor(newWidth / 2)
		landscape.centerY = Math.floor(newHeight / 2)
		svgWidth = newWidth * tileWidth
		svgHeight = newHeight * tileHeight
		animate = false
		redraw++
		clearLandscape()
		updateLandscape()
	}

	function clearLandscape() {
		landscape.rowsGenerated = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
		landscape.pondTiles.length = 0
		landscape.newPondTiles.length = 0
		landscape.nextID = 1
	}

	function updateLandscape() {
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (initializing || !landscape.width) return
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rowsGenerated > 0) clearLandscape()
			return
		} else if (firstDraw || landscape.rowsGenerated > 0) {
			firstDraw = false
			animate = true
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow,
			`${seed}`
		)
		hide = false
	}

	$: if (containerWidth && containerHeight)
		updateDimensions(containerWidth, containerHeight - 10)

	store.landscapeNewGame.subscribe((newGame) => {
		if (!newGame) return
		initializing = false
		store.landscapeNewGame.set(false)
		firstDraw = true
		redraw++
		clearLandscape()
		// Skip update if landscapeFullView is true, because it is about to change
		if (!get(store.landscapeFullView)) updateLandscape()
	})
	store.landscapeNewRow.subscribe((newRow) => {
		if (!newRow) return
		store.landscapeNewRow.set(false)
		updateLandscape()
	})
	store.landscapeRedraw.subscribe((doRedraw) => {
		if (!doRedraw) return
		firstDraw = true
		redraw++
		clearLandscape()
		updateLandscape()
		store.landscapeRedraw.set(false)
	})
	// Hide landscape until it updates to avoid flashing on FF
	store.landscapeFullView.subscribe(() => (hide = true))

	type FlashColorHandler = (x: number, y: number, duration: number) => void
	const featureComponents: {
		flashColor: FlashColorHandler
	}[] = []
	let pondComponent: {
		flashColor: FlashColorHandler
	}

	function updateMousePosition({
		offsetX,
		offsetY,
	}: {
		offsetX: number
		offsetY: number
	}) {
		mouseX = -0.1 + (offsetX / svgWidth) * (landscape.width * 1.5 + 0.2)
		mouseY = -0.1 + (offsetY / svgHeight) * (landscape.height + 0.2)
	}

	let lastFlashAt = 0
	let flashDurationExtra = 0
	let lastFlashXY: null | XY = null
	let lastFlashTimeout: NodeJS.Timeout
	let flashAnimateElement: SVGAnimateElement
	$: landscapeSpan = getDistance(landscape.width + 3, landscape.height + 3)

	const flashColors: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		updateMousePosition(event)
		const now = Date.now()
		// This is brilliant
		flashDurationExtra = Math.max(
			0,
			Math.min(3500, flashDurationExtra + lastFlashAt + 250 - now)
		)
		lastFlashXY = [mouseX, mouseY]
		clearTimeout(lastFlashTimeout)
		lastFlashTimeout = setTimeout(() => (lastFlashXY = null), 200)
		tick().then(() => flashAnimateElement?.beginElement())
		const duration = landscapeSpan * 70 + flashDurationExtra
		featureComponents.forEach((f) => f?.flashColor(mouseX, mouseY, duration))
		pondComponent.flashColor(mouseX, mouseY, duration)
		lastFlashAt = now
	}

	let mouseOver = false
	let mouseX: number
	let mouseY: number

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return
		mouseOver = true
		updateMousePosition(event)
		// console.log(mouseX, mouseY)
	}
	const onMouseLeave = () => (mouseOver = false)

	$: if (svgElement) store.landscapeSVG.set(svgElement)
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		style:display={hide ? 'none' : 'block'}
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		style:left="{Math.floor((containerWidth - svgWidth) / 2)}px"
		viewBox="-0.1 -0.1 {landscape.width * 1.5 + 0.2} {landscape.height + 0.2}"
		on:pointerdown={flashColors}
		on:pointermove={onPointerMove}
		on:mouseleave={onMouseLeave}
		bind:this={svgElement}
	>
		{#key `${seed}${redraw}`}
			<Pond
				bind:this={pondComponent}
				tiles={landscape.pondTiles}
				newTiles={landscape.newPondTiles}
				{animate}
				delay={landscape.pondDelay || 0}
				{mouseOver}
				{mouseX}
				{mouseY}
				landscapeWidth={landscape.width}
				landscapeHeight={landscape.height}
				mini={landscape.mini}
				forceColor={$landscapeForceColor}
				fillDuration={landscape.totalDelay || 0}
			/>
			{#each landscape.features as feature, f (feature.id)}
				{#if feature.type === 'tree'}
					<Tree
						id={feature.id}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						size={feature.size}
						{animate}
						delay={feature.delay}
						{mouseOver}
						{mouseX}
						{mouseY}
						forceColor={$landscapeForceColor}
						bind:this={featureComponents[f]}
					/>
				{:else}
					<Hill
						id={feature.id}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						size={feature.size}
						mini={landscape.mini}
						{animate}
						delay={feature.delay}
						{mouseOver}
						{mouseX}
						{mouseY}
						forceColor={$landscapeForceColor}
						bind:this={featureComponents[f]}
					/>
				{/if}
			{/each}
		{/key}
		{#if lastFlashXY}
			{@const [cx, cy] = lastFlashXY}
			<ellipse
				{cx}
				{cy}
				style:transform-origin="{cx}px {cy}px"
				rx="3"
				ry="2"
				fill="#fff7"
			>
				<animate
					bind:this={flashAnimateElement}
					id="landscape_flash_animate"
					attributeName="opacity"
					values="1;0"
					calcMode="spline"
					keySplines={bezierEasing.circOut}
					dur="200ms"
					fill="freeze"
					begin="indefinite"
				/>
				<animateTransform
					attributeName="transform"
					type="scale"
					values="0;0.5"
					calcMode="spline"
					keySplines={bezierEasing.circOut}
					dur="200ms"
					fill="freeze"
					begin="landscape_flash_animate.begin"
				/>
			</ellipse>
		{/if}
	</svg>
</div>

<!-- <button
	on:click={() => {
		seed++
		clearLandscape()
		updateLandscape()
	}}
	style="position: absolute; top: 50px; right: 10px;">seed</button
> -->
<style>
	div {
		height: calc(100% + 8px);
		margin-top: -8px;
		position: relative;
	}
	svg {
		position: absolute;
		top: 8px;
		overflow: visible;
		touch-action: manipulation;
	}
</style>
