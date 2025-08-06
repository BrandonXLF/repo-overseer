import { request } from '@octokit/request';
import { useEffect, useState } from 'react';
import './UserActions.css';

async function doAuth(publicOnly?: boolean) {
	window.open(
		`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}${publicOnly ? '' : '&scope=repo'}`,
	);
}

export default function UserActions({
	onUserChanged,
	onAuthToken,
}: Readonly<{
	onUserChanged: (apiUser: string) => void;
	onAuthToken: (auth: string) => void;
}>) {
	const [auth, setAuth] = useState(
		() => localStorage.getItem('repo-overseer-auth') ?? '',
	);
	const [user, setUser] = useState('');

	// Process OAuth callbacks
	useEffect(() => {
		const onMessage = async (e: MessageEvent) => {
			if (
				e.origin !== window.location.origin ||
				e.data.source !== 'github-auth'
			)
				return;

			setAuth(`Bearer ${e.data.token}`);
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, []);

	// Update user when auth changes
	useEffect(() => {
		if (!auth) {
			setAuth('');
			return;
		}

		(async () => {
			const res = await request('GET /user', {
				headers: {
					authorization: auth,
				},
			});

			setUser(res.data.login);
		})();
	}, [auth]);

	// Dispatch event and save authorization token
	useEffect(() => {
		onAuthToken(auth);
		localStorage.setItem('repo-overseer-auth', auth);
	}, [onAuthToken, auth]);

	// Dispatch user changed event
	useEffect(() => {
		onUserChanged(user);
	}, [onUserChanged, user]);

	return user ? (
		<div>
			{user}
			<button
				onClick={() => {
					setAuth('');
					setUser('');
				}}
			>
				Sign-out
			</button>
		</div>
	) : (
		<div>
			<button onClick={() => doAuth()}>Sign-in</button>
			<div>
				(
				<button
					title="Only grant access to public repositories. Reduces the scope required, but will not show issues and pull requests in private repositories."
					onClick={() => doAuth(true)}
					className="link-button"
				>
					Grant public only
				</button>
				)
			</div>
		</div>
	);
}
