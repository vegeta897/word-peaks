export const ROWS = 6
export const WORD_LENGTH = 5

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const keyboardLayoutNames = [
	'alphabetic',
	'qwerty',
	'azerty',
	'qwertz',
	'dvorak',
	'colemak',
	'alphabetic_reversed',
] as const
export type KeyboardLayout = typeof keyboardLayoutNames[number]
export const keyboardLayoutOptions: {
	value: KeyboardLayout
	label: string
	layout: [string[], string[], string[]]
	wideKeysRow: 0 | 1 | 2
}[] = [
	{
		value: 'alphabetic',
		label: 'Alphabetic',
		layout: [
			['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
			['u', 'v', 'w', 'x', 'y', 'z'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'qwerty',
		label: 'QWERTY',
		layout: [
			['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['z', 'x', 'c', 'v', 'b', 'n', 'm'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'azerty',
		label: 'AZERTY',
		layout: [
			['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
			['z', 'x', 'c', 'v', 'b', 'n'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'qwertz',
		label: 'QWERTZ',
		layout: [
			['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['y', 'x', 'c', 'v', 'b', 'n', 'm'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'dvorak',
		label: 'Dvorak',
		layout: [
			['p', 'y', 'f', 'g', 'c', 'r', 'l'],
			['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
			['q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
		],
		wideKeysRow: 0,
	},
	{
		value: 'colemak',
		label: 'Colemak',
		layout: [
			['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y'],
			['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o'],
			['z', 'x', 'c', 'v', 'b', 'k', 'm'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'alphabetic_reversed',
		label: 'Alphabetic (reversed)',
		layout: [
			['z', 'y', 'x', 'w', 'v', 'u', 't', 's', 'r', 'q'],
			['p', 'o', 'n', 'm', 'l', 'k', 'j', 'i', 'h', 'g'],
			['f', 'e', 'd', 'c', 'b', 'a'],
		],
		wideKeysRow: 2,
	},
]

export const OptionsIconPathData =
	'M32.34 0c-3 0-4.83 2.59-5.41 5.67l-.82 4.26a30.24 30.24 0 0 0-6.64 3.84l-4.09-1.42c-2.68-.93-6.12-.75-7.62 1.85l-5.41 9.38c-1.5 2.59-.16 5.46 2.2 7.52l3.27 2.84a30.24 30.24 0 0 0-.26 3.85 30.24 30.24 0 0 0 .26 3.82l-3.28 2.84c-2.15 1.85-3.7 4.92-2.2 7.52l5.41 9.37c1.5 2.6 4.65 2.88 7.61 1.86l4.07-1.41a30.24 30.24 0 0 0 6.68 3.87l.82 4.26c.53 2.79 2.41 5.67 5.41 5.67h10.82c3 0 4.82-2.59 5.42-5.67l.81-4.22a30.24 30.24 0 0 0 6.74-3.88l4.07 1.4c2.85.99 6.11.75 7.61-1.85L73.23 52c1.5-2.6.17-5.48-2.21-7.53l-3.25-2.81a30.24 30.24 0 0 0 .26-3.87 30.24 30.24 0 0 0-.25-3.91l3.23-2.81c2.28-1.98 3.7-4.93 2.2-7.52l-5.41-9.38c-1.5-2.6-4.66-2.88-7.62-1.85l-4.07 1.42a30.24 30.24 0 0 0-6.72-3.87l-.81-4.2C48 2.71 46.16 0 43.16 0H32.34zm5.45 20.98a16.82 16.82 0 1 1 0 33.64 16.82 16.82 0 1 1 0-33.64z'

export const DiscordIconPathData =
	'M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z'

export const BlueskyIconPathData =
	'M135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z'
