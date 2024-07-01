import { request } from "@octokit/request"
import { components } from "@octokit/openapi-types";
import { useEffect, useRef, useState } from "react";
import Issue from "./Issue";
import './IssueList.css';
import classNames from "classnames";

type List = undefined | 'loading' | components['schemas']['issue-search-result-item'][];

async function dOAuth(publicOnly?: boolean) {
	window.open(`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&${publicOnly ? '' : 'scope=repo'}`);
}

const tabs = [
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

export default function IssueList() {
	const [list, setList] = useState<List>();
	const [filter, setFilter] = useState('');
	const [owner, setOwner] = useState(localStorage.getItem('repo-overseer-owner') ?? '');
	const [auth, setAuth] = useState(localStorage.getItem('repo-overseer-auth') ?? '');
	const [user, setUser] = useState('');

	const inputRef = useRef<HTMLInputElement>(null);

	// Set input value to initial owner
	useEffect(() => {
		if (!inputRef.current) return;
		inputRef.current.value = owner;
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
		if (!owner) {
			setList(undefined);
			return;
		}

		(async () => {
			const res = await request('GET /search/issues', {
				q: `user:${owner} is:open sort:updated-desc ${filter}`,
				headers: {
					authorization: auth
				}
			});
		
			setList(res.data.items);
		})();
	}, [auth, filter, owner]);

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
			setUser(res.data.login);
		})();
	}, [auth]);

	// Save authorization token
	useEffect(() => {
		localStorage.setItem('repo-overseer-auth', auth);
	}, [auth]);

	// Save owner
	useEffect(() => {
		localStorage.setItem('repo-overseer-owner', owner);
	}, [owner]);

	let listContents;

	if (list === undefined) {
		listContents =<div>Search for a user above to get started!</div>;
	} else if (list === 'loading') {
		listContents = <div>Loading...</div>;
	} else {
		listContents = list.map(item => <Issue key={item.id} item={item} />);
	}

	let userActions;

	if (user) {
		userActions = <>
			{user}
			<button onClick={() => {
				setAuth('');
				setUser('');
			}}>Sign-out</button>
		</>;
	} else {
		userActions = <>
		<button onClick={() => dOAuth()}>Sign-in</button>
		<div className="login-actions">
		(<button
			title="Only grant access to public repositories. Reduces the scope required, but will not show issues and pull requests in private repositories."
			onClick={() => dOAuth(true)}
			className="link-button"
		>
			Grant public only
		</button>)
		</div>
		</>;
	}

	return <div>
		<div id="search">
			<form onSubmit={() => setOwner(inputRef.current?.value ?? '')}>
				<input ref={inputRef} />
				<button>Go</button>
				{user && <button onClick={() => setOwner(user)} type="button">Me</button>}
			</form>
			<div>
				{userActions}
			</div>
		</div>
		<div id="tabs">
			{Array.isArray(list) && tabs.map(tab => {
				return <button
					key={tab.filter}
					onClick={() => setFilter(tab.filter)}
					className={classNames({
						tab: true,
						selected: tab.filter === filter
					})}
				>
					{tab.name}
				</button>
			})}
			<div className="filler"></div>
		</div>
		<div id="issue-list">
			{listContents}
		</div>
	</div>;
}