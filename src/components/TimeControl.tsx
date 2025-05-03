import { useCallback, useEffect, useRef, useState } from 'react'
import { formatTime, formatVolume } from '../utils/player'

interface TimeControlProps {
	type: 'video' | 'volume'
	value: number
	max: number
	min: number
	onChange: (value: number) => void
}

export function TimeControl({
	type = 'video',
	value = 0,
	max = 100,
	onChange,
}: TimeControlProps) {
	const [isHovering, setIsHovering] = useState(false)
	const [hoverPosition, setHoverPosition] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [hoverValue, setHoverValue] = useState(0)
	const controlTimeRef = useRef<HTMLDivElement>(null)
	const percentage = (value / max) * 100

	const handleMouseMove = useCallback(
		(event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
			if (!controlTimeRef.current) return

			const controlTime = controlTimeRef.current
			const rect = controlTime.getBoundingClientRect()
			let clientX = 0

			if ('touches' in event) clientX = event.touches[0].clientX
			if (!('touches' in event)) clientX = event.clientX

			const pos = Math.min(Math.max(clientX - rect.left, 0), rect.width)
			const percent = pos / rect.width
			const newValue = percent * max

			setHoverPosition(pos)
			setHoverValue(newValue)

			if (isDragging) onChange(newValue)
		},
		[isDragging, onChange, max]
	)

	const handleMouseClick = useCallback(() => {}, [])

	const handleMouseEnter = useCallback(() => {
		setIsHovering(true)
	}, [])

	const handleMouseDown = useCallback(
		(event: React.MouseEvent | React.TouchEvent) => {
			setIsDragging(true)
			handleMouseMove(event)
		},
		[handleMouseMove]
	)

	const handleMouseLeave = useCallback(() => {
		setIsHovering(false)
		if (!isDragging) setIsDragging(false)
	}, [isDragging])

	const handleMouseUp = useCallback(() => {
		if (!isDragging) return
		setIsDragging(false)
		onChange(hoverValue)
	}, [onChange, isDragging, hoverValue])

	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
			document.addEventListener('touchmove', handleMouseMove)
			document.addEventListener('touchend', handleMouseUp)
		} else {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.removeEventListener('touchmove', handleMouseMove)
			document.removeEventListener('touchend', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.removeEventListener('touchmove', handleMouseMove)
			document.removeEventListener('touchend', handleMouseUp)
		}
	}, [isDragging, handleMouseUp, handleMouseMove])

	return (
		<div className="relative w-full h-6 flex items-center mx-auto">
			<div
				ref={controlTimeRef}
				className="relative w-full h-2 bg-gray-300 rounded cursor-pointer"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMove}
				onMouseDown={handleMouseDown}
				onTouchStart={handleMouseDown}
				onClick={handleMouseClick}
			>
				<div
					className="absolute rounded h-2 bg-blue-600 select-none"
					style={{ width: `${percentage}%` }}
				/>

				<div
					className="absolute rounded-full -translate-x-1/2 -translate-y-1/4 size-4 bg-blue-800 select-none"
					style={{ left: `${percentage}%` }}
				/>

				{(isHovering || isDragging) && (
					<div
						className="z-50 absolute bg-slate-950/80 text-white px-3 py-2 rounded text-xs -translate-x-1/2 translate-y-1/2 whitespace-nowrap pointer-events-none"
						style={{
							left: `${(hoverPosition / (controlTimeRef.current?.clientWidth || 1)) * 100}%`,
							bottom: `${8 * 4}px`,
						}}
					>
						{type === 'video'
							? formatTime(hoverValue)
							: formatVolume(hoverValue)}
					</div>
				)}
			</div>
		</div>
	)
}

export function TimePopUp({
	hoverTime,
	position,
	type,
	max,
}: {
	hoverTime: number
	position: { x: number; y: number }
	type: 'video' | 'volume'
	max: number
}) {
	if (!hoverTime) return null

	return (
		<div
			className="absolute bg-blue-950/60 text-white px-1.5 py-2.5 rounded text-xs"
			style={{ top: position.y + 10, left: position.x - 25 }}
		>
			{type === 'video' && `${Math.floor(hoverTime)}s`}
			{type === 'volume' && `${Math.floor((hoverTime / max) * 100)}%`}
		</div>
	)
}
