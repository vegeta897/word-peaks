<script lang="ts">
	import { WORD_LENGTH } from '$lib/data-model'
	import type { Board } from '$lib/data-model'
	import { beforeUpdate } from 'svelte'

	export let board: Board
	export let rowHeight: number
	export let columnWidth: number

	const grassHeight = 5

	let pathData: string = ''

	beforeUpdate(() => {
		const islandData: { x: number; y: number }[][] = [
			[
				{ x: 0.5, y: 1 },
				{ x: 1, y: 0.5 },
				{ x: 1.5, y: 0 },
				{ x: 2, y: 0.5 },
				{ x: 2.5, y: 1 },
				{ x: 3, y: 1.5 },
				{ x: 3, y: 2.5 },
				{ x: 2.5, y: 3 },
				{ x: 0.5, y: 3 },
				{ x: 0, y: 2.5 },
				{ x: 0, y: 1.5 },
			],
		]
		const holeData: { x: number; y: number }[][] = [
			[
				{ x: 1.5, y: 1 },
				{ x: 1, y: 1.5 },
				{ x: 1.5, y: 2 },
				{ x: 2, y: 1.5 },
			],
		]
		// type PathPart =
		// 	| ['M' | 'L' | 'l', number, number]
		// 	| ['H' | 'h' | 'V' | 'v', number]
		// 	| ['A' | 'a', number, number, number, 0 | 1, 0 | 1, number, number]
		const tileRadius = Math.min(rowHeight, columnWidth) / 3
		const xToCorner = columnWidth / 2 - tileRadius
		const yToCorner = rowHeight / 2 - tileRadius

		pathData = [...islandData, ...holeData]
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
							(horizontal && y < lastY === x > lastX) || (vertical && y > lastY === x > lastX)
						const sweep = innerCorner ? 0 : 1
						const xDir = x > lastX ? 1 : -1
						const yDir = y > lastY ? 1 : -1
						const hLine = `h${xToCorner * xDir}`
						const vLine = `v${yToCorner * yDir}`
						const arc = `a${tileRadius} ${tileRadius} 0 0 ${sweep} ${tileRadius * xDir} ${
							tileRadius * yDir
						}`
						const pathPart = horizontal ? `${hLine} ${arc} ${vLine}` : `${vLine} ${arc} ${hLine}`
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
