import { components } from "@octokit/openapi-types";
import './Issue.css';
import { ReactComponent as IssueIcon } from './issue.svg';
import { ReactComponent as PrIcon } from './pr.svg';
import classNames from "classnames";

const repoRegex = /.*\/([^/]+\/[^/]+)$/;

function formatDate(dateStr: string) {
	return new Intl.DateTimeFormat(navigator.language, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(dateStr));
}

export default function Issue({ item }: Readonly<{
	item: components['schemas']['issue-search-result-item']
}>) {
	const repoName = repoRegex.exec(item.repository_url)?.[1];

	return <div className={classNames({
		issue: true,
		open: item.state === 'open'
	})}>
		<div className="issue-repo">
			{item.pull_request
				? <PrIcon />
				: <IssueIcon />}
			<a href={`https://www.github.com/${repoName}`}>{repoName}</a>
		</div>
		<div className="issue-title">
			<a href={item.html_url}>{item.title}</a>
		</div>
		<div className="issue-info">
			#{item.number} opened on {formatDate(item.created_at)} by {item.user?.login}.
			Last updated {formatDate(item.updated_at)}.
		</div>
	</div>;
}