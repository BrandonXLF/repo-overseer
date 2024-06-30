import { request } from "@octokit/request"
import { components } from "@octokit/openapi-types";
import { useEffect, useRef, useState } from "react";
import Issue from "./Issue";
import './IssueList.css';

type List = undefined | 'loading' | components['schemas']['issue-search-result-item'][];

export default function IssueList() {
	const [list, setList] = useState<List>();
	const inputRef = useRef<HTMLInputElement>(null);
	const [user, setUser] = useState(localStorage.getItem('repo-overseer-user') ?? '');

	useEffect(() => {
		if (!user) {
			setList(undefined);
			return;
		}

		(async () => {
			const res = await request('GET /search/issues', {
				q: `user:${user} is:open sort:updated-desc`
			});
		
			setList(res.data.items);
		})();
	}, [user]);

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
		<div className="search">
			<input ref={inputRef} />
			<button onClick={() => setUser(inputRef.current?.value ?? '')}>Go</button>
		</div>
		<div id="issue-list">
			{listContents}
		</div>
	</div>;
}