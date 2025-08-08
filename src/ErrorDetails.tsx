import './ErrorDetails.css';

export default function ErrorDetails({
	error,
	reset,
}: Readonly<{ error: string; reset?: string }>) {
	const resetTime = reset
		? new Intl.DateTimeFormat(navigator.language, {
				timeStyle: 'medium',
			}).format(new Date(+reset * 1000))
		: '';

	return (
		<div>
			<h3 className="error-title">Error</h3>
			<div>{error}</div>
			{reset && <p>Rate limit resets at {resetTime}</p>}
		</div>
	);
}
