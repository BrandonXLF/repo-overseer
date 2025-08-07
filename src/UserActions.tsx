import { request } from '@octokit/request';
import { useEffect, useState } from 'react';
import './UserActions.css';

const modes = {
	ALL: 'Public + private repos',
	PUBLIC: 'Public repos only',
};

async function doAuth(allRepos?: boolean) {
	window.open(
		`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=${allRepos ? 'repo' : ''}`,
	);
}

interface User {
	name: string;
	all: boolean;
}

export default function UserActions({
	onUserChanged,
	onAuthToken,
}: Readonly<{
	onUserChanged: (apiUser: string) => void;
	onAuthToken: (auth: string) => void;
}>) {
	const [signInAllRepos, setSignInAllRepos] = useState(true);
	const [auth, setAuth] = useState(
		() => localStorage.getItem('repo-overseer-auth') ?? '',
	);
	const [user, setUser] = useState<User | undefined>();

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
			setUser(undefined);
			return;
		}

		(async () => {
			const res = await request('GET /user', {
				headers: {
					authorization: auth,
				},
			});

			setUser({
				name: res.data.login,
				all: res.headers['x-oauth-scopes']?.includes('repo') ?? false,
			});
		})();
	}, [auth]);

	// Dispatch event and save authorization token
	useEffect(() => {
		onAuthToken(auth);
		localStorage.setItem('repo-overseer-auth', auth);
	}, [onAuthToken, auth]);

	// Dispatch user changed event
	useEffect(() => {
		onUserChanged(user?.name ?? '');
	}, [onUserChanged, user]);

	return auth ? (
		<div>
			{user ? (
				<>
					{user.name ?? 'Loading...'}{' '}
					<span className="token-mode">
						({user.all ? modes.ALL : modes.PUBLIC})
					</span>
				</>
			) : (
				'Loading...'
			)}
			<button
				onClick={() => {
					setAuth('');
					setUser(undefined);
				}}
			>
				Sign-out
			</button>
		</div>
	) : (
		<div>
			<select
				onChange={(e) => setSignInAllRepos(e.target.value === 'all')}
			>
				<option value="all">{modes.ALL}</option>
				<option value="public">{modes.PUBLIC}</option>
			</select>
			<button onClick={() => doAuth(signInAllRepos)}>Sign-in</button>
		</div>
	);
}
