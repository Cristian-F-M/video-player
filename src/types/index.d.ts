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
