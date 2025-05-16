export interface SettingsType {
	videoUrl: string | null
	fileVideo: File | null
	frames: number
	velocity: number
	muted: boolean
	isPlaying: boolean
	volume: number
}

export type BigIconVideoType = 'play' | 'pause' | null

export interface SPEED_OPTION {
	id: string
	value: string
	text: string
}
