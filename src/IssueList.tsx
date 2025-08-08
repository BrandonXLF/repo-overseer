import ErrorDetails from './ErrorDetails';
import Issue from './Issue';
import { List, RequestStatus } from './ListArea';
import NextStatus from './NextStatus';
import './IssueList.css';

export default function IssueList({
	list,
	nextStatus,
	loadMore,
}: Readonly<{
	list: List;
	nextStatus: RequestStatus | undefined;
	loadMore: (() => void) | undefined;
}>) {
	switch (list.state) {
		case 'unset':
			return <div>Search for a user above to get started!</div>;
		case 'loading':
			return <div>Loading...</div>;
		case 'error':
			return <ErrorDetails error={list.error} reset={list.reset} />;
		case 'loaded':
			if (!list.items.length) {
				return <div>No results found.</div>;
			}

			return (
				<div>
					<div className="issue-list-items">
						{list.items.map((item) => (
							<Issue key={item.id} item={item} />
						))}
					</div>
					<div className="issue-list-next-status">
						<NextStatus status={nextStatus} />
					</div>
					{loadMore && nextStatus?.state !== 'loading' && (
						<div className="issue-list-next">
							<button className="load-more" onClick={loadMore}>
								Load more
							</button>
						</div>
					)}
				</div>
			);
	}
}
