import type { SettingsType } from '@/types'

export function Video({
	videoRef,
	onTimeUpdate,
	onLoadedMetadata,
	onSeeking,
	onSeeked,
	settings,
	...props
}: {
	videoRef: React.Ref<HTMLVideoElement>
	onTimeUpdate: () => void
	onLoadedMetadata: () => void
	onSeeking: () => void
	onSeeked: () => void
	settings: SettingsType
} & React.HTMLAttributes<HTMLVideoElement>) {
	return (
		<video
			ref={videoRef}
			className="size-full bg-black"
			onTimeUpdate={onTimeUpdate}
			onLoadedMetadata={onLoadedMetadata}
			onSeeking={onSeeking}
			onSeeked={onSeeked}
			{...props}
		>
			<source src={settings.videoUrl || undefined} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	)
}
