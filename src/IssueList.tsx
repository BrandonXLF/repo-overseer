import { request } from "@octokit/request"
import { components } from "@octokit/openapi-types";
import { useCallback, useEffect, useState } from "react";
import Issue from "./Issue";
import './IssueList.css';
import { RequestError } from "@octokit/request-error";
import UserActions from "./UserActions";
import SearchForm from "./SearchForm";
import ListTabs from "./ListTabs";

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

export default function IssueList() {
	const [list, setList] = useState<List>({ state: 'unset' });
	const [queryId, setQueryId] = useState(0);

	const [typeFilter, setTypeFilter] = useState('');
	const [stateFilter, setStateFilter] = useState('');
	const [repoOwner, setRepoOwner] = useState('');
	const [auth, setAuth] = useState('');
	const [apiUser, setApiUser] = useState('');

	const processNewOwner = useCallback((newOwner: string) => {
		setRepoOwner(newOwner);
		setQueryId(queryId => queryId + 1);
	}, []);

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
	}, [auth, queryId, typeFilter, repoOwner, stateFilter]);

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

	return <div>
		<div id="actions">
			<SearchForm apiUser={apiUser} onRepoOwnerChanged={processNewOwner} />
			<UserActions onUserChanged={setApiUser} onAuthToken={setAuth} />
		</div>
		<ListTabs onTypeFilterSet={setTypeFilter} onStateFilterSet={setStateFilter} />
		<div id="issue-list">
			{listContents}
		</div>
	</div>;
}