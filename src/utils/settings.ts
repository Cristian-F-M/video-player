import type { SettingsType, SPEED_OPTION } from '@/types'


export const SPEED_OPTIONS: SPEED_OPTION[] = [
	 { id: '0.25x', text: '0.25x', value: '0.25' },
  { id: '0.5x', text: '0.5x', value: '0.5' },
  { id: '0.75x', text: '0.75x', value: '0.75' },
  { id: '1x', text: '1x (default)', value: '1' },
  { id: '1.25x', text: '1.25x', value: '1.25' },
  { id: '1.5x', text: '1.5x', value: '1.5' },
  { id: '1.75x', text: '1.75x', value: '1.75' },
  { id: '2x', text: '2x', value: '2' },
]

const default_settings: SettingsType = {
	videoUrl: null,
	fileVideo: null,
	frames: 30,
	velocity: 1,
	muted: false,
	isPlaying: false,
	volume: 100,
}

export function getSettings() {
	const settings = JSON.parse(
		localStorage.getItem('settings') || `${default_settings}`
	)
	return settings
}

export function saveSettings(key: string, value: string) {
	const settings = getSettings()
	settings[key] = value
	localStorage.setItem('settings', JSON.stringify(settings))
}

export function removeSettings(key: string) {
	const settings = getSettings()
	delete settings[key]
	localStorage.setItem('settings', JSON.stringify(settings))
}

export function clearSettings() {
	localStorage.removeItem('settings')
}
