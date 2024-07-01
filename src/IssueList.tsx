import { request } from "@octokit/request"
import { components } from "@octokit/openapi-types";
import { useEffect, useRef, useState } from "react";
import Issue from "./Issue";
import './IssueList.css';
import classNames from "classnames";

type List = undefined | 'loading' | components['schemas']['issue-search-result-item'][];

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
	const [user, setUser] = useState(localStorage.getItem('repo-overseer-user') ?? '');

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!user) {
			setList(undefined);
			return;
		}

		(async () => {
			const res = await request('GET /search/issues', {
				q: `user:${user} is:open sort:updated-desc ${filter}`
			});
		
			setList(res.data.items);
		})();
	}, [filter, user]);

	useEffect(() => {
		localStorage.setItem('repo-overseer-user', user);
	}, [user]);

	useEffect(() => {
		if (!inputRef.current) return;
		inputRef.current.value = user;
	});

	let listContents;

	if (list === undefined) {
		listContents =<div>Search for a user above to get started!</div>;
	} else if (list === 'loading') {
		listContents = <div>Loading...</div>;
	} else {
		listContents = list.map(item => <Issue key={item.id} item={item} />);
	}

	return <div>
		<div id="search">
			<form onSubmit={() => setUser(inputRef.current?.value ?? '')}>
				<input ref={inputRef} />
				<button>Go</button>
			</form>
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