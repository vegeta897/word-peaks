<script lang="ts">
	import { WORD_LENGTH } from '$lib/data-model'
	import type { Board } from '$lib/data-model'
	import { beforeUpdate } from 'svelte'

	export let board: Board
	export let rowHeight: number
	export let columnWidth: number

	let cachedBoard: Board

	const grassHeight = 5

	const edgeData: { x: number; y: number }[][] = []
	let pathData: string = ''

	beforeUpdate(() => {
		if (board !== cachedBoard) {
			cachedBoard = board
			edgeData.length = 0
			//TODO: Move this to a different file

			const inBounds = (x: number, y: number) =>
				y >= 0 && y < board.length && x >= 0 && x < WORD_LENGTH
			const isGrass = (x: number, y: number) =>
				inBounds(x, y) && board[y][x].polarity === 0
			// Move this to Graph.svelte
			// const randomBoard = board.map((row) =>
			// 	[...row].map((tile) => ({ polarity: Math.random() > 0.5 ? 1 : 0 }))
			// )
			// const isGrass = (x: number, y: number) => inBounds(x, y) && randomBoard[y][x].polarity === 0
			const isEdge = (x: number, y: number) =>
				x === 0 || y === 0 || y === board.length - 1 || x === WORD_LENGTH - 1

			type Dir = 'up' | 'down' | 'left' | 'right'

			const turnCW: Record<Dir, Dir> = {
				right: 'down',
				down: 'left',
				left: 'up',
				up: 'right',
			}
			const turnCCW: Record<Dir, Dir> = {
				right: 'up',
				down: 'right',
				left: 'down',
				up: 'left',
			}
			const go: Record<Dir, (x: number, y: number) => [number, number]> = {
				up: (x: number, y: number) => [x, y - 1],
				down: (x: number, y: number) => [x, y + 1],
				left: (x: number, y: number) => [x - 1, y],
				right: (x: number, y: number) => [x + 1, y],
			}
			const goTurn: Record<Dir, (x: number, y: number) => [number, number]> = {
				up: (x: number, y: number) => [x - 1, y - 1],
				down: (x: number, y: number) => [x + 1, y + 1],
				left: (x: number, y: number) => [x - 1, y + 1],
				right: (x: number, y: number) => [x + 1, y - 1],
			}

			let grassMode: boolean

			const crawled: (undefined | true)[][] = new Array(board.length)
				.fill(0)
				.map(() => new Array(WORD_LENGTH))

			const crawlTiles = (x: number, y: number): boolean => {
				if (crawled[y][x]) return
				crawled[y][x] = true
				let invalid = false
				const neighbors = Object.values(go).map((fn) => fn(x, y))
				if (grassMode) neighbors.push(...Object.values(goTurn).map((fn) => fn(x, y)))
				for (const neighbor of neighbors) {
					if (inBounds(...neighbor) && isGrass(...neighbor) === grassMode) {
						if (!grassMode && isEdge(...neighbor)) invalid = true
						const crawled = crawlTiles(...neighbor)
						invalid = invalid || crawled
					}
				}
				return invalid
			}

			let edged: (undefined | Dir)[][]
			let shape: { x: number; y: number }[]

			const edge = (x: number, y: number, moving: Dir) => {
				if (edged[y][x] === moving) return
				edged[y][x] = edged[y][x] || moving
				shape.push(
					{
						up: { x, y: y + 0.5 },
						down: { x: x + 1, y: y + 0.5 },
						left: { x: x + 0.5, y: y + 1 },
						right: { x: x + 0.5, y },
					}[moving]
				)
				// Just trust this
				if (grassMode) {
					if (isGrass(...goTurn[moving](x, y)))
						return edge(...goTurn[moving](x, y), turnCCW[moving])
					if (isGrass(...go[moving](x, y))) return edge(...go[moving](x, y), moving)
				} else {
					if (!isGrass(...go[moving](x, y))) {
						if (!isGrass(...goTurn[moving](x, y)))
							return edge(...goTurn[moving](x, y), turnCCW[moving])
						return edge(...go[moving](x, y), moving)
					}
				}
				edge(x, y, turnCW[moving])
			}

			for (let y = 0; y < board.length; y++) {
				const row = board[y]
				for (let x = 0; x < row.length; x++) {
					if (crawled[y][x]) continue
					grassMode = isGrass(x, y)
					if (!grassMode && isEdge(x, y)) continue
					const invalidHole = crawlTiles(x, y)
					if (!grassMode && invalidHole) continue
					edged = new Array(board.length).fill(0).map(() => new Array(WORD_LENGTH))
					shape = []
					edge(x, y, 'right')
					edgeData.push(grassMode ? shape : shape.reverse())
				}
			}
		}

		const tileRadius = Math.min(rowHeight, columnWidth) / 3
		const xToCorner = columnWidth / 2 - tileRadius
		const yToCorner = rowHeight / 2 - tileRadius

		pathData = edgeData
			.map((nodes) => {
				const [first, ...rest] = nodes
				let pathString = `M${first.x * columnWidth} ${first.y * rowHeight} `
				let { x: lastX, y: lastY } = first
				let vertical = lastX === Math.floor(lastX)
				let horizontal = !vertical
				pathString += [...rest, first]
					.map(({ x, y }) => {
						if (x === lastX) {
							lastY = y
							return `V${y * rowHeight}`
						}
						if (y === lastY) {
							lastX = x
							return `H${x * columnWidth}`
						}
						const innerCorner =
							(horizontal && y < lastY === x > lastX) ||
							(vertical && y > lastY === x > lastX)
						const sweep = innerCorner ? 0 : 1
						const xDir = x > lastX ? 1 : -1
						const yDir = y > lastY ? 1 : -1
						const hLine = `h${xToCorner * xDir}`
						const vLine = `v${yToCorner * yDir}`
						const arc = `a${tileRadius} ${tileRadius} 0 0 ${sweep} ${tileRadius * xDir} ${
							tileRadius * yDir
						}`
						const pathPart = horizontal
							? `${hLine} ${arc} ${vLine}`
							: `${vLine} ${arc} ${hLine}`
						vertical = !vertical
						horizontal = !horizontal
						lastX = x
						lastY = y
						return pathPart
					})
					.join('')
				pathString += ' Z'
				return pathString
			})
			.join('')
	})

	let fill = '#D6D3D7'
</script>

<path fill-rule="evenodd" stroke={fill} {fill} d={pathData} />
<svg y={grassHeight}>
	<path stroke={fill} fill="none" d={pathData} />
</svg>
