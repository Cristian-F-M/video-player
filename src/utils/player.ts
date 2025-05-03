export function formatTime(time: number) {
	const minutes = Math.floor(time / 60)
	const seconds = Math.floor(time % 60)
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export function formatVolume(vol: number) {
	const percentage = Math.floor(vol)
	return `${percentage}%`
}
