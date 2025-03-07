import { type XY } from './math'

export type PathDataCommand = [command: string, ...params: (number | XY)[]]

export function stringifyPathData(
	pathData: PathDataCommand[],
	scaleX = 15,
	scaleY = 10,
	offsetX = 0,
	offsetY = 0
) {
	let pathDataString = ''
	for (const [command, ...params] of pathData) {
		pathDataString +=
			command +
			params.map((param) => {
				if (typeof param === 'number') return param
				// Use toFixed to round, and Number() to remove unnecessary zeroes
				return (
					Number((param[0] * scaleX + offsetX).toFixed(2)) +
					',' +
					Number((param[1] * scaleY + offsetY).toFixed(2))
				)
			})
	}
	return pathDataString
}
