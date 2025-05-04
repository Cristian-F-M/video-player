import type { SettingsType } from '@/types'

export function Video({
	videoRef,
	onTimeUpdate,
	onLoadedMetadata,
	onSeeking,
	onSeeked,
	settings,
  onEnd,
	...props
}: {
	videoRef: React.Ref<HTMLVideoElement>
	onTimeUpdate: () => void
	onLoadedMetadata: () => void
	onSeeking: () => void
	onSeeked: () => void
  onEnd?: () => void
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
      onEnded={onEnd}
			{...props}
		>
			<source src={settings.videoUrl || undefined} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	)
}
