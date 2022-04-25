import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import type { Stats } from '$lib/data-model'
import { newStats } from '$lib/data-model'

export const storeVersion: Writable<number> = storageWritable('wp-version', 0)
export const storedLocale: Writable<string> = storageWritable('wp-locale', '')

export const openScreen: Writable<null | 'options' | 'tutorial' | 'results'> = writable(null)

export const highContrast: Writable<boolean> = storageWritable('wp-highContrast', false)
export const showAllHints: Writable<boolean> = storageWritable('wp-showAllHints', false)
export const swapEnterBackspace: Writable<boolean> = storageWritable('wp-swapEnterBackspace', false)
export const keyboardLayout: Writable<string> = storageWritable('wp-keyboardLayout', 'qwerty')
export const dyslexicFont: Writable<boolean> = storageWritable('wp-dyslexicFont', false)

export const lastPlayedDaily: Writable<number> = storageWritable('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = storageWritable('wp-stats', newStats())

export const newUser: Writable<boolean> = writable(false)
