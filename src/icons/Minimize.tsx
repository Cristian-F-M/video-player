export default function Minimize(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<title>Exit Full Screen</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
			<path d="M15 5v2a2 2 0 0 0 2 2h2" />
			<path d="M5 15h2a2 2 0 0 1 2 2v2" />
			<path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
		</svg>
	)
}
