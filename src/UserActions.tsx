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

export default function UserActions({
	onUserChanged,
	onAuthToken,
}: Readonly<{
	onUserChanged: (apiUser: string) => void;
	onAuthToken: (auth: string) => void;
}>) {
	const [signInAllRepos, setSignInAllRepos] = useState(true);
	const [auth, setAuth] = useState(() => {
		const token = localStorage.getItem('repo-overseer-auth') ?? '';
		const all = !!localStorage.getItem('repo-overseer-all');

		return token ? { token, all } : undefined;
	});
	const [user, setUser] = useState('');

	// Process OAuth callbacks
	useEffect(() => {
		const onMessage = async (e: MessageEvent) => {
			if (
				e.origin !== window.location.origin ||
				e.data.source !== 'github-auth'
			)
				return;

			setAuth({
				token: `Bearer ${e.data.token}`,
				all: e.data.scope.includes('repo'),
			});
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, []);

	// Update user when auth changes
	useEffect(() => {
		if (!auth) {
			setUser('');
			return;
		}

		(async () => {
			const res = await request('GET /user', {
				headers: {
					authorization: auth.token,
				},
			});

			setUser(res.data.login);
		})();
	}, [auth]);

	// Dispatch event and save authorization token
	useEffect(() => {
		const authToken = auth?.token ?? '';

		onAuthToken(authToken);
		localStorage.setItem('repo-overseer-auth', authToken);

		if (auth?.all) {
			localStorage.setItem('repo-overseer-all', 'true');
		} else {
			localStorage.removeItem('repo-overseer-all');
		}
	}, [onAuthToken, auth]);

	// Dispatch user changed event
	useEffect(() => {
		onUserChanged(user);
	}, [onUserChanged, user]);

	return auth ? (
		<div>
			{user || 'Loading...'}{' '}
			<span className="token-mode">
				({auth.all ? modes.ALL : modes.PUBLIC})
			</span>
			<button
				onClick={() => {
					setAuth(undefined);
					setUser('');
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
