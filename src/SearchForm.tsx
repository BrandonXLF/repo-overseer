import { useCallback, useEffect, useRef } from 'react';
import './TopActions.css';

export default function SearchForm({
	apiUser,
	onRepoOwnerChanged,
}: Readonly<{
	apiUser: string;
	onRepoOwnerChanged: (repoOwner: string) => void;
}>) {
	const inputRef = useRef<HTMLInputElement>(null);

	const processOwnerInput = useCallback(() => {
		const repoOwner = inputRef.current?.value ?? '';
		localStorage.setItem('repo-overseer-owner', repoOwner);
		onRepoOwnerChanged(inputRef.current?.value ?? '');
	}, [onRepoOwnerChanged]);

	const setOwnerInput = useCallback(
		(newOwner: string) => {
			inputRef.current!.value = newOwner;
			processOwnerInput();
		},
		[processOwnerInput],
	);

	// Load saved repo owner
	useEffect(() => {
		const initialOwner = localStorage.getItem('repo-overseer-owner') ?? '';
		inputRef.current!.value = initialOwner;
		onRepoOwnerChanged(initialOwner);
	}, [onRepoOwnerChanged]);

	// Replace empty repo owner with logged-in user
	useEffect(() => {
		if (inputRef.current!.value || !apiUser) return;
		setOwnerInput(apiUser);
	}, [apiUser, setOwnerInput]);

	return (
		<form
			className="top-actions"
			onSubmit={(e) => {
				e.preventDefault();
				processOwnerInput();
			}}
		>
			<input ref={inputRef} />
			<button>Go</button>
			{apiUser && (
				<button onClick={() => setOwnerInput(apiUser)} type="button">
					Me
				</button>
			)}
		</form>
	);
}
