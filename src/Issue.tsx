import { components } from "@octokit/openapi-types";
import './Issue.css';

function formatDate(dateStr: string) {
	return new Intl.DateTimeFormat(navigator.language, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(dateStr));
}

export default function Issue({ item }: Readonly<{
	item: components['schemas']['issue-search-result-item']
}>) {
	return <div className="issue">
		<div>
			<a href={item.html_url}>{item.title}</a>
		</div>
		<div>
			#{item.number} opened on {formatDate(item.created_at)} by {item.user?.login}.
			Last updated {formatDate(item.updated_at)}.
		</div>
	</div>;
}