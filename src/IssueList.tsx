import { request } from "@octokit/request"
import { components } from "@octokit/openapi-types";
import { useEffect, useRef, useState } from "react";
import Issue from "./Issue";
import './IssueList.css';
import classNames from "classnames";
import { RequestError } from "@octokit/request-error";

type List = {
	state: 'unset' | 'loading';
} | {
	state: 'error';
	error: string;
	reset?: string;
} | { 
	state: 'loaded';
	items: components['schemas']['issue-search-result-item'][]
};

async function doAuth(publicOnly?: boolean) {
	window.open(`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&${publicOnly ? '' : 'scope=repo'}`);
}

const types = [
	{
		name: 'Combined',
		filter: ''
	},
	{
		name: 'Issues',
		filter: 'is:issue'
	},
	{
		name: 'Pull Requests',
		filter: 'is:pr'
	}
];

const states = [
	{
		name: 'Open',
		filter: 'is:open'
	},
	{
		name: 'Closed',
		filter: 'is:closed'
	},
	{
		name: 'All',
		filter: ''
	}
];

export default function IssueList() {
	const [list, setList] = useState<List>({ state: 'unset' });
	const [typeFilter, setTypeFilter] = useState(types[0].filter);
	const [stateFilter, setStateFilter] = useState(states[0].filter);
	const [repoOwner, setRepoOwner] = useState(localStorage.getItem('repo-overseer-owner') ?? '');
	const [auth, setAuth] = useState(localStorage.getItem('repo-overseer-auth') ?? '');
	const [apiUser, setApiUser] = useState('');

	const inputRef = useRef<HTMLInputElement>(null);

	// Set input value to initial owner
	useEffect(() => {
		if (!inputRef.current) return;
		inputRef.current.value = repoOwner;
	});

	// Process OAuth callbacks 
	useEffect(() => {
		window.addEventListener('message', async e => {
			if (
				e.origin !== window.location.origin ||
				e.data.source !== 'github-auth'
			) return;

			setAuth(`Bearer ${e.data.token}`);
		});
	});

	// Make API request for the list
	useEffect(() => {
		if (!repoOwner) {
			setList({ state: 'unset' });
			return;
		}

		setList({ state: 'loading' });

		(async () => {
			try {
				const res = await request('GET /search/issues', {
					q: `user:${repoOwner} ${stateFilter} ${typeFilter} sort:updated-desc`,
					headers: {
						authorization: auth
					}
				});

				setList({
					state: 'loaded',
					items: res.data.items
				});
			} catch (e) {
				if (!(e instanceof RequestError)) throw e;

				const obj: {
					state: 'error';
					error: string;
					reset?: string;
				} = {
					state: 'error',
					error: e.message
				};

				if (e.message.includes('rate limit')) {
					obj.reset = e.response?.headers['x-ratelimit-reset'] ?? '';
				}

				setList(obj);
			}
		})();
	}, [auth, typeFilter, repoOwner, stateFilter]);

	// Update user when auth changes
	useEffect(() => {
		if (!auth) {
			setAuth('');
			return;
		}

		(async () => {
			const res = await request('GET /user', {
				headers: {
					authorization: auth
				}
			});
			setApiUser(res.data.login);
		})();
	}, [auth]);

	// Replace empty repo owner with logged-in user
	useEffect(() => {
		if (repoOwner || !apiUser) return;
		setRepoOwner(apiUser);
	}, [repoOwner, apiUser])

	// Save authorization token
	useEffect(() => {
		localStorage.setItem('repo-overseer-auth', auth);
	}, [auth]);

	// Save owner
	useEffect(() => {
		localStorage.setItem('repo-overseer-owner', repoOwner);
	}, [repoOwner]);

	let listContents;

	switch (list.state) {
		case 'unset':
			listContents =<div>Search for a user above to get started!</div>;
			break;
		case 'loading':
			listContents = <div>Loading...</div>;
			break;
		case 'loaded':
			listContents = list.items.map(item => <Issue key={item.id} item={item} />);
			break;
		case 'error': {
			const resetTime = list.reset
				? new Intl.DateTimeFormat(navigator.language, {
					timeStyle: 'medium'
				}).format(new Date(+list.reset * 1000))
				: '';

			listContents = <div>
				<h3 className="error-title">Error</h3>
				<div>{list.error}</div>
				{list.reset && <p>Rate limit resets at {resetTime}</p>}
			</div>;
		}
	}

	let userActions;

	if (apiUser) {
		userActions = <>
			{apiUser}
			<button onClick={() => {
				setAuth('');
				setApiUser('');
			}}>Sign-out</button>
		</>;
	} else {
		userActions = <>
		<button onClick={() => doAuth()}>Sign-in</button>
		<div>
			(<button
				title="Only grant access to public repositories. Reduces the scope required, but will not show issues and pull requests in private repositories."
				onClick={() => doAuth(true)}
				className="link-button"
			>
				Grant public only
			</button>)
		</div>
		</>;
	}

	return <div>
		<div id="actions">
			<form onSubmit={e => {
				e.preventDefault();
				setRepoOwner(inputRef.current?.value ?? '')
			}}>
				<input ref={inputRef} />
				<button>Go</button>
				{apiUser && <button onClick={() => setRepoOwner(apiUser)} type="button">Me</button>}
			</form>
			<div>
				{userActions}
			</div>
		</div>
		<div id="tabs">
			{types.map(type => <button
				key={type.filter}
				onClick={() => setTypeFilter(type.filter)}
				className={classNames({
					tab: true,
					selected: type.filter === typeFilter
				})}
			>
				{type.name}
			</button>)}
			<div id="tab-filler" />
			<select
				className="tab"
				value={stateFilter}
				onChange={e => setStateFilter(e.target.value)}
			>
				{states.map(state => <option key={state.filter} value={state.filter}>
					{state.name}
				</option>)}
			</select>
		</div>
		<div id="issue-list">
			{listContents}
		</div>
	</div>;
}