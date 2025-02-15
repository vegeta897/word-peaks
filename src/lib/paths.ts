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
			params.map((param) =>
				typeof param === 'number'
					? param
					: `${param[0] * scaleX + offsetX},${param[1] * scaleY + offsetY}`
			)
	}
	return pathDataString
}
