import { request } from '@octokit/request';
import { components } from '@octokit/openapi-types';
import { useCallback, useEffect, useState } from 'react';
import { RequestError } from '@octokit/request-error';
import UserActions from './UserActions';
import SearchForm from './SearchForm';
import ListTabs from './ListTabs';
import IssueList from './IssueList';
import './ListArea.css';

export type RequestStatus =
	| {
			state: 'loading';
	  }
	| {
			state: 'error';
			error: string;
			reset?: string;
	  };

export type List =
	| RequestStatus
	| {
			state: 'unset';
	  }
	| {
			state: 'error';
			error: string;
			reset?: string;
	  }
	| {
			state: 'loaded';
			items: components['schemas']['issue-search-result-item'][];
	  };

const nextPattern = /(?<=<)(\S*)(?=>; rel="Next")/i;

export default function ListArea() {
	const [list, setList] = useState<List>({ state: 'unset' });

	const [typeFilter, setTypeFilter] = useState('');
	const [stateFilter, setStateFilter] = useState('');
	const [repoOwner, setRepoOwner] = useState('');
	const [auth, setAuth] = useState('');
	const [apiUser, setApiUser] = useState('');
	const [nextStatus, setNextStatus] = useState<RequestStatus | undefined>(
		undefined,
	);
	const [nextPage, setNextPage] = useState<number | null>(null);

	const processNewOwner = useCallback((newOwner: string) => {
		setRepoOwner(newOwner);
	}, []);

	const makeRequest = useCallback(
		async (loadMoreRequest?: boolean) => {
			if (!loadMoreRequest) {
				setNextStatus(undefined);
			}

			if (!repoOwner) {
				setList({ state: 'unset' });
				return;
			}

			const setStatus = loadMoreRequest ? setNextStatus : setList;
			setStatus({ state: 'loading' });

			try {
				const res = await request('GET /search/issues', {
					q: `user:${repoOwner} ${stateFilter} ${typeFilter} sort:updated-desc`,
					headers: {
						authorization: auth,
					},
					page: loadMoreRequest ? (nextPage ?? 1) : undefined,
				});

				const nextUrl = res.headers.link?.match(nextPattern)?.[0];
				const newNextPage =
					nextUrl && new URL(nextUrl).searchParams.get('page');
				setNextPage(newNextPage ? +newNextPage : null);

				if (loadMoreRequest) {
					setList((prevList) => {
						if (prevList.state !== 'loaded') {
							return prevList;
						}

						return {
							state: 'loaded',
							items: [...prevList.items, ...res.data.items],
						};
					});

					setNextStatus(undefined);
				} else {
					setList({
						state: 'loaded',
						items: res.data.items,
					});
				}
			} catch (e) {
				if (!(e instanceof RequestError)) throw e;

				const obj: {
					state: 'error';
					error: string;
					reset?: string;
				} = {
					state: 'error',
					error: e.message,
				};

				if (e.message.includes('rate limit')) {
					obj.reset = e.response?.headers['x-ratelimit-reset'] ?? '';
				}

				setStatus(obj);
			}
		},
		[auth, nextPage, repoOwner, stateFilter, typeFilter],
	);

	useEffect(() => {
		makeRequest();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth, repoOwner, stateFilter, typeFilter]);

	return (
		<div>
			<div id="actions">
				<SearchForm
					apiUser={apiUser}
					onRepoOwnerChanged={processNewOwner}
				/>
				<UserActions onUserChanged={setApiUser} onAuthToken={setAuth} />
			</div>
			<div id="tabs">
				<ListTabs
					apiUser={apiUser}
					onTypeFilterSet={setTypeFilter}
					onStateFilterSet={setStateFilter}
				/>
			</div>
			<div id="issue-list">
				<IssueList
					list={list}
					nextStatus={nextStatus}
					loadMore={
						nextPage !== null ? () => makeRequest(true) : undefined
					}
				/>
			</div>
		</div>
	);
}
