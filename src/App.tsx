import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Play from './icons/Play'
import Pause from './icons/Pause'
import VolumeActive from './icons/VolumeActive'
import VolumeMute from './icons/VolumeMute'
import Maximize from './icons/Maximize'
import Settings from './icons/Settings'
import Close from './icons/X'
import Upload from './icons/Upload'
import { getSettings, saveSettings } from './utils/settings'
import { TimeControl } from './components/TimeControl'
import { formatTime } from './utils/player'
import Minimize from './icons/Minimize'
import { Video } from '@/components/Video'
import type { BigIconVideoType, SettingsType } from '@/types'

function App() {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(100)
	const videoRef = useRef<HTMLVideoElement>(null)
	const containerVideoRef = useRef<HTMLDivElement>(null)
	const [isShowingControls, setIsShowingControls] = useState(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const iconShowTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const settingsFormRef = useRef<HTMLFormElement>(null)
	const [iconShow, setIconShow] = useState<BigIconVideoType>(null)
	const [isSeeking, setIsSeeking] = useState(false)
	const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
	const [settings, setSettings] = useState<SettingsType>({
		videoUrl: null,
		fileVideo: null,
		frames: 30,
		velocity: 1,
		muted: false,
		isPlaying: false,
		volume: 100,
	})
	const [wasFullScreen, setWasFullScreen] = useState(false)

	const isMobileDevice = useMemo(() => {
		return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
	}, [])

	const togglePlay = useCallback(() => {
		if (!videoRef.current) return
		if (isPlaying) videoRef.current.pause()
		if (!isPlaying) videoRef.current.play()
		setIsPlaying((prev) => !prev)
	}, [isPlaying])

	const toggleMute = useCallback(() => {
		if (!videoRef.current) return
		videoRef.current.muted = !isMuted
		saveSettings('muted', (!isMuted).toString())
		setIsMuted(!isMuted)
	}, [isMuted])

	const handleLoadedMetadata = useCallback(() => {
		if (videoRef.current) {
			setDuration(videoRef.current.duration)
		}
	}, [])

	const handleTimeUpdate = useCallback(() => {
		if (!videoRef.current) return
		setCurrentTime(videoRef.current.currentTime)
	}, [])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const target = event.target as HTMLElement
			const { tagName } = target

			const isTyping =
				tagName === 'INPUT' ||
				tagName === 'TEXTAREA' ||
				target.isContentEditable

			if (isTyping) return

			if (event.code === 'Space' || event.code === 'KeyK') {
				togglePlay()
				return
			}
			if (event.code === 'ArrowLeft') {
				goBackward()
				return
			}

			if (event.code === 'ArrowRight') {
				moveForward()
				return
			}

			if (event.code === 'KeyL') {
				moveForward(10)
				return
			}

			if (event.code === 'KeyJ') {
				goBackward(10)
				return
			}

			if (event.code === 'Period') {
				moveForward(1 / settings.frames)
				return
			}

			if (event.code === 'Comma') {
				goBackward(1 / settings.frames)
				return
			}

			if (event.code === 'KeyM') {
				toggleMute()
				return
			}

			if (event.code === 'KeyF') {
				handleFullScreen()
				return
			}

			if (event.code === 'Escape') {
				exitFullscreen()
				closeSideMenu()
				return
			}

			if (event.code === 'ArrowUp') {
				if (!videoRef.current) return
				if (isMuted) {
					setIsMuted(false)
					saveSettings('muted', 'false')
					videoRef.current.muted = false
				}

				const currentVolume = Number(videoRef.current.volume.toFixed(1))
				showControls()
				hideControls()
				if (currentVolume >= 1) return

				videoRef.current.volume += 0.1
				setVolume((prev) => prev + 10)
				setSettings((prev) => {
					saveSettings('volume', (prev.volume + 10).toString())
					return { ...prev, volume: prev.volume + 10 }
				})
			}

			if (event.code === 'ArrowDown') {
				if (!videoRef.current) return

				const currentVolume = Number(videoRef.current.volume.toFixed(1))

				showControls()
				hideControls()

				if (currentVolume <= 0) {
					setIsMuted(true)
					videoRef.current.muted = true
					saveSettings('muted', 'true')
					return
				}

				videoRef.current.volume -= 0.1
				setSettings((prev) => {
					saveSettings('volume', (prev.volume - 10).toString())
					return { ...prev, volume: prev.volume - 10 }
				})
				setVolume((prev) => prev - 10)
			}
		},
		[togglePlay, toggleMute, isMuted, settings.frames]
	)

	const handleChangeRangeTime = useCallback((newTime: number) => {
		if (!videoRef.current) return

		setCurrentTime(newTime)
		videoRef.current.currentTime = newTime
	}, [])

	const handleChangeRangeVolume = useCallback(
		(newVol: number) => {
			if (!videoRef.current) return
			if (isMuted && newVol >= 1) toggleMute()

			setVolume(Number(newVol))
			videoRef.current.volume = newVol / 100
			saveSettings('volume', Number(newVol).toString())
		},
		[toggleMute, isMuted]
	)

	const moveForward = useCallback((seconds = 5) => {
		if (!videoRef.current) return
		setIsPlaying(false)
		videoRef.current.pause()

		videoRef.current.currentTime += seconds
		setCurrentTime((prev) => prev + seconds)
	}, [])

	const goBackward = useCallback((seconds = 5) => {
		if (!videoRef.current) return
		setIsPlaying(false)
		videoRef.current.pause()
		videoRef.current.currentTime -= seconds
		setCurrentTime((prev) => prev - seconds)
	}, [])

	const showControls = useCallback(() => {
		if (!settings.videoUrl) return
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		setIsShowingControls(true)
	}, [settings.videoUrl])

	const hideControls = useCallback(() => {
		timeoutRef.current = setTimeout(() => {
			setIsShowingControls(false)
		}, 700)
	}, [])

	const handleFullScreen = useCallback(() => {
		const isFullScreen = document.fullscreenElement !== null

		if (isFullScreen) return exitFullscreen()
		requestFullScreen()
		setWasFullScreen(true)
	}, [])

	const getIsFullScreen = useCallback(
		() => document.fullscreenElement !== null,
		[]
	)

	const requestFullScreen = useCallback(() => {
		document.documentElement.classList.add('full-screen')
		if (!getIsFullScreen()) document.documentElement.requestFullscreen()
	}, [getIsFullScreen])

	const exitFullscreen = useCallback(() => {
		document.documentElement.classList.remove('full-screen')
		if (getIsFullScreen()) document.exitFullscreen()
		setWasFullScreen(false)
	}, [getIsFullScreen])

	const toggleControls = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		if (!isShowingControls) showControls()
		if (isShowingControls) hideControls()
	}, [showControls, hideControls, isShowingControls])

	const handleClick = useCallback(() => {
		if (!settings.videoUrl) return
		toggleControls()

		if (!isMobileDevice) return togglePlay() // Mobile device

		if (timeoutRef.current) clearTimeout(timeoutRef.current)
	}, [isMobileDevice, togglePlay, toggleControls, settings.videoUrl])

	const handleSeeking = useCallback(() => {
		setIsSeeking(true)
	}, [])

	const handleSeeked = useCallback(() => {
		setIsSeeking(false)
	}, [])

	const handleMouseMove = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		if (!settings.videoUrl) return
		showControls()

		timeoutRef.current = setTimeout(() => {
			hideControls()
		}, 700)
	}, [showControls, hideControls, settings.videoUrl])

	const closeSideMenu = useCallback(() => {
		setIsSideMenuOpen(false)
		if (wasFullScreen) requestFullScreen()
	}, [requestFullScreen, wasFullScreen])

	const openSideMenu = useCallback(() => {
		if (isPlaying) {
			setIsPlaying(false)
			videoRef.current?.pause()
		}
		setIsSideMenuOpen(true)
	}, [isPlaying])

	const closeSideMenuOverlay = useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			e.stopPropagation()
			const target = e.target as HTMLElement
			const isSideMenu = target.closest('.side-menu')

			if (!isSideMenu) closeSideMenu()
		},
		[closeSideMenu]
	)

	const handleChangeFile = useCallback(() => {
		if (!settingsFormRef.current) return

		const form = settingsFormRef.current
		const fileInput = form.querySelector(
			'input[name="fileVideo"]'
		) as HTMLInputElement
		const urlInput = form.querySelector(
			'input[name="videoUrl"]'
		) as HTMLInputElement

		if (!fileInput || !urlInput || !fileInput.files) return

		if (fileInput.files.length > 0) {
			const file = fileInput.files[0]
			urlInput.value = URL.createObjectURL(file)
		}
	}, [])

	useEffect(() => {
		hideControls()
	}, [hideControls])

	useEffect(() => {
		if (iconShowTimeoutRef.current) clearTimeout(iconShowTimeoutRef.current)
		const icon: typeof iconShow = isPlaying ? 'play' : 'pause'

		setIconShow(icon)
		iconShowTimeoutRef.current = setTimeout(() => {
			setIconShow(null)
		}, 500)
	}, [isPlaying])

	const handleSubmitForm = useCallback(
		(e: SubmitEvent) => {
			e.preventDefault()
			const form = e.target as HTMLFormElement
			if (!videoRef.current) return

			const { videoUrl, velocity, frames } = form.elements as unknown as {
				videoUrl: HTMLInputElement
				fileVideo: HTMLInputElement
				frames: HTMLInputElement
				velocity: HTMLSelectElement
			}
			const source = videoRef.current.querySelector('source')

			const [currentPlaybackRate, currentSrc] = [
				videoRef.current.playbackRate,
				source?.getAttribute('src'),
			]

			if (currentPlaybackRate !== Number(velocity.value))
				videoRef.current.playbackRate = Number(velocity.value)

			if (currentSrc !== videoUrl.value) {
				videoRef.current
					.querySelector('source')
					?.setAttribute('src', videoUrl.value)
				videoRef.current.load()
			}

			setSettings({
				videoUrl: videoUrl.value,
				fileVideo: null,
				frames: Number(frames.value),
				velocity: Number(velocity.value),
				muted: isMuted,
				isPlaying: isPlaying,
				volume: volume,
			})
			saveSettings('frames', frames.value)
			saveSettings('velocity', velocity.value)
			closeSideMenu()
			if (wasFullScreen) requestFullScreen()
		},
		[
			closeSideMenu,
			isMuted,
			isPlaying,
			volume,
			requestFullScreen,
			wasFullScreen,
		]
	)

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		videoRef.current?.addEventListener('click', handleClick)
		containerVideoRef.current?.addEventListener('mouseenter', showControls)
		containerVideoRef.current?.addEventListener('mouseleave', hideControls)
		containerVideoRef.current?.addEventListener('mousemove', handleMouseMove)
		containerVideoRef.current?.addEventListener('touchmove', handleMouseMove)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			videoRef.current?.removeEventListener('click', handleClick)
			containerVideoRef.current?.removeEventListener('mouseenter', showControls)
			containerVideoRef.current?.removeEventListener('mouseleave', hideControls)
			containerVideoRef.current?.removeEventListener(
				'mousemove',
				handleMouseMove
			)
			containerVideoRef.current?.removeEventListener(
				'touchmove',
				handleMouseMove
			)
		}
	}, [handleKeyDown, showControls, hideControls, handleClick, handleMouseMove])

	useEffect(() => {
		settingsFormRef.current?.addEventListener('submit', handleSubmitForm)

		return () => {
			settingsFormRef.current?.removeEventListener('submit', handleSubmitForm)
		}
	}, [handleSubmitForm])

	useEffect(() => {
		const settings = getSettings()

		setSettings((prev) => {
			return {
				...prev,
				frames: Number(settings.frames) || 30,
				velocity: Number(settings.velocity) || 1,
				volume: Number(settings.volume) || 100,
				isMuted: settings.muted === 'true',
			}
		})

		setIsMuted(settings.muted === 'true')
		setVolume(settings.volume)

		if (!videoRef.current) return
		const vol = settings.volume / 100
		videoRef.current.volume = !Number.isFinite(vol) ? 1 : vol
		videoRef.current.muted = settings.muted === 'true'
	}, [])

	return (
		<main className="bg-gradient-to-b from-slate-900 to-indigo-900 size-full min-h-screen min-w-screen py-6 flex flex-row fullscreen:pt-0">
			<div className="flex flex-col w-full h-fit max-w-11/12 md:max-w-5xl fullscreen:max-w-full fullscreen:h-screen mx-auto bg-black text-white rounded-lg overflow-hidden">
				<div className="relative size-full" ref={containerVideoRef}>
					<Video
						videoRef={videoRef}
						className="size-full bg-black"
						onTimeUpdate={handleTimeUpdate}
						onLoadedMetadata={handleLoadedMetadata}
						onSeeking={handleSeeking}
						onSeeked={handleSeeked}
						settings={settings}
						onEnd={() => setIsPlaying(false)}
					/>

					{/* Play - Pause icon  */}
					<div
						className={`big-icon z-[60] absolute text-white top-2/4 left-2/4  -translate-y-5/6 md:-translate-y-2/4 -translate-x-2/4 pointer-events-none ${iconShow !== null ? '' : 'hidden'}`}
					>
						<Play
							className={`size-10 md:size-14 ${iconShow === 'play' ? '' : 'hidden'}`}
						/>
						<Pause
							className={`size-10 md:size-14 ${iconShow === 'pause' ? '' : 'hidden'}`}
						/>
					</div>
					{/* end-Play/Pause icon  */}

					{/* controls */}
					<div
						className={`time absolute z-50 bottom-0 px-2 w-full justify-center bg-blue-950/60 py-2 flex flex-col gap-2 ${isShowingControls ? '' : 'hidden'}`}
					>
						<div className="w-full flex flex-row items-center gap-2">
							<div className="text-gray-300 text-sm ">
								{formatTime(currentTime)}
							</div>
							<div className="w-8/12 md:w-11/12 flex items-center mx-auto">
								<TimeControl
									max={duration}
									value={currentTime}
									onChange={handleChangeRangeTime}
									type="video"
									min={0}
								/>
							</div>
							<div className="text-gray-300 text-sm ">
								{formatTime(duration)}
							</div>
						</div>
						<div className="flex flex-row items-center justify-between text-gray-400">
							<div className="flex flex-row items-center gap-3">
								<div
									className="flex items-center cursor-pointer hover:text-gray-100 transition-colors"
									onClick={togglePlay}
								>
									{isPlaying ? (
										<Pause className="size-5 md:size-6" />
									) : (
										<Play className="size-5 md:size-6" />
									)}
								</div>
								<div className="flex flex-row items-center gap-2 hover:text-gray-100 transition-colors">
									<div
										className="flex items-center cursor-pointer"
										onClick={toggleMute}
									>
										{isMuted || volume <= 0 ? (
											<VolumeMute className="size-5 md:size-6" />
										) : (
											<VolumeActive className="size-5 md:size-6" />
										)}
									</div>
									<div className="w-30 max-w-2/4 md:max-w-full">
										<TimeControl
											max={100}
											value={isMuted ? 0 : volume}
											onChange={handleChangeRangeVolume}
											type="volume"
											min={0}
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-row items-center gap-2 text-gray-400">
								<div
									className="cursor-pointer hover:text-gray-100 transition-colors"
									onClick={openSideMenu}
								>
									<Settings className="size-5 md:size-6" />
								</div>
								<div
									className="cursor-pointer hover:text-gray-100 transition-colors"
									onClick={handleFullScreen}
								>
									<Maximize className="size-5 md:size-6 fullscreen:hidden" />
									<Minimize className="size-5 md:size-6 hidden fullscreen:block" />
								</div>
							</div>
						</div>
					</div>
					{/* end-controls */}

					{/* Seek loading */}
					<div
						className={`seek-loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50  ${isSeeking ? '' : 'hidden'}`}
					>
						<output className="bg-red-400 ">
							<svg
								aria-hidden="true"
								className="size-6 md:size-8 animate-spin text-gray-200 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
							<span className="sr-only">Loading...</span>
						</output>
					</div>
					{/* end-Seek loading */}

					{/* no video */}
					<div
						className={`absolute z-[120] inset-0 bg-gray-950 flex flex-col items-center justify-center gap-2 px-4 py-2 ${settings.videoUrl ? 'hidden' : ''}`}
					>
						<Upload className="size-10 md:size-20 text-white" />
						<div className="flex flex-col items-center">
							<h2>No hay video cargado</h2>
							<p className="text-xs md:text-sm text-gray-400 text-center w-10/12 md:w-8/12 mx-auto">
								Carga un video desde tu dispositivo o ingresa una URL para
								comenzar a reproducir.
							</p>
						</div>
						<button
							onClick={openSideMenu}
							type="button"
							className="bg-slate-800 py-2 px-4 rounded-lg active:bg-slate-700 hover:bg-slate-700 transition-colors cursor-pointer mt-2 text-sm md:text-base"
						>
							Upload Video
						</button>
					</div>
					{/* end-no video */}
				</div>
			</div>

			{/* overlay side menu */}
			<div
				className={`overlay-side-menu bg-gray-400/40 inset-0 z-[200] backdrop-blur-xs fixed ${isSideMenuOpen ? '' : 'hidden'}`}
				onClick={closeSideMenuOverlay}
			>
				{/* side menu */}
				<div
					className={`side-menu absolute h-full bg-slate-900 shadow-lg shadow-gray-700/40 w-full max-w-11/12 md:max-w-88 top-0 right-0 p-4 rounded-sm z-[200] ${isSideMenuOpen ? '' : 'hidden'}`}
				>
					<header className="flex flex-row justify-between text-white">
						<div className="flex flex-col">
							<h1>Video Player Settings</h1>
							<span className="text-xs text-gray-400">
								Personaliza las opciones del reproductor de video
							</span>
						</div>
						<Close
							className="size-6  cursor-pointer text-gray-300 hover:text-white transition-colors"
							onClick={closeSideMenu}
						/>
					</header>
					<div className="mt-5">
						<form className="flex flex-col gap-5" ref={settingsFormRef}>
							{/* Video file */}
							<div className="flex flex-col justify-center gap-1">
								<label htmlFor="file-video" className="text-sm text-gray-200">
									Upload file
								</label>
								<input
									type="file"
									id="file-video"
									name="fileVideo"
									className="block w-full rounded-sm p-1 border border-gray-400 max-w-md text-gray-400 text-xs file:bg-transparent file:border-0 file:py-1 file:px-3 file:rounded-md file:text-sm file:font-semibold file:text-gray-200 focus:outline-none cursor-pointer file:cursor-pointer"
									accept="video/*"
									onChange={handleChangeFile}
								/>
							</div>
							{/* end-Video file */}

							{/* Video url */}
							<div className="flex flex-col justify-center gap-1">
								<label htmlFor="video-url" className="text-sm text-gray-200">
									Video url
								</label>
								<input
									type="url"
									id="video-url"
									name="videoUrl"
									className="block w-full rounded-sm p-1 h-9 px-2 border border-gray-400 max-w-md text-gray-200 text-xs  focus:outline-none"
									placeholder="https://..."
								/>
							</div>
							{/* end-Video url */}

							{/* FPS */}
							<div className="flex flex-col justify-center gap-1">
								<label htmlFor="frames" className="text-sm text-gray-200">
									Frames per second (FPS)
								</label>
								<input
									type="number"
									id="frames"
									name="frames"
									className="block w-full rounded-sm p-1 h-9 px-2 border border-gray-400 max-w-md text-gray-200 text-xs  focus:outline-none track:hidden"
									placeholder="30"
									value={settings.frames}
									onChange={(e) => {
										const value = e.target.value
										setSettings((prev) => {
											return { ...prev, frames: Number(value) }
										})
									}}
								/>
							</div>
							{/* end-FPS */}

							{/* velocity */}
							<div className="flex flex-col justify-center gap-1">
								<label htmlFor="velocity" className="text-sm text-gray-200">
									Velocity
								</label>
								<select
									name="velocity"
									id="velocity"
									className="block w-full rounded-sm p-1 h-9 px-2 border border-gray-400 max-w-md text-gray-300 text-xs  focus:outline-none cursor-pointer track:hidden [&>option]:text-gray-300  [&>option]:bg-gray-800"
									defaultValue={settings.velocity}
								>
									<option value="0.25">0.25x</option>
									<option value="0.5">0.5x</option>
									<option value="0.75">0.75x</option>
									<option value="1">1x (default)</option>
									<option value="1.25">1.25x</option>
									<option value="1.5">1.5x</option>
									<option value="1.75">1.75x</option>
									<option value="2">2x</option>
								</select>
							</div>
							{/* end-Velocity */}

							<button
								type="submit"
								className="bg-gray-300 py-auto h-9 rounded-lg active:bg-gray-400 hover:bg-gray-400 transition-colors cursor-pointer"
							>
								Save
							</button>
						</form>
					</div>
				</div>
				{/* end-side menu */}
			</div>
			{/* end-overlay side menu */}
		</main>
	)
}

export default App
