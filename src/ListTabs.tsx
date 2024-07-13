import classNames from 'classnames';
import { useEffect, useState } from 'react';
import './ListTabs.css';

const separatorText = '-------------';
const loggedIn = (apiUser: string) => !!apiUser;

const types = [
	{
		name: 'Combined',
		filter: '',
	},
	{
		name: 'Issues',
		filter: 'is:issue',
	},
	{
		name: 'Pull Requests',
		filter: 'is:pr',
	},
];

const states = [
	{
		name: 'All open',
		filter: 'is:open',
	},
	{
		name: 'Unassigned',
		filter: 'is:open no:assignee',
	},
	{
		name: 'My tasks',
		filter: 'is:open assignee:__ME__',
		cond: loggedIn
	},
	{
		name: 'By me',
		filter: 'is:open author:__ME__',
		cond: loggedIn
	},
	{
		name: 'By others',
		filter: 'is:open -author:__ME__',
		cond: loggedIn
	},
	{
		separator: true,
	},
	{
		name: 'Closed',
		filter: 'is:closed',
	},
	{
		separator: true,
	},
	{
		name: 'Everything',
		filter: '',
	},
];

const defaultStateFilter = states[0].filter as string;

export default function ListTabs({
	apiUser,
	onTypeFilterSet,
	onStateFilterSet,
}: Readonly<{
	apiUser: string;
	onTypeFilterSet: (typeFilter: string) => void;
	onStateFilterSet: (stateFilter: string) => void;
}>) {
	const [typeFilter, setTypeFilter] = useState(types[0].filter);

	useEffect(() => {
		onStateFilterSet(defaultStateFilter);
	}, [onStateFilterSet]);

	useEffect(() => {
		onTypeFilterSet(typeFilter);
	}, [onTypeFilterSet, typeFilter]);

	return (
		<div id="tabs">
			{types.map((type) => (
				<button
					key={type.filter}
					onClick={() => setTypeFilter(type.filter)}
					className={classNames({
						tab: true,
						selected: type.filter === typeFilter,
					})}
				>
					{type.name}
				</button>
			))}
			<div id="tab-filler" />
			<select
				className="tab"
				defaultValue={defaultStateFilter}
				onChange={(e) =>
					onStateFilterSet(e.target.value?.replace(/__ME__/, apiUser))
				}
			>
				{states.map((state) =>
					!state.cond || state.cond(apiUser) ? (
						<option
							key={state.filter}
							value={state.filter}
							disabled={state.separator}
						>
							{state.separator ? separatorText : state.name}
						</option>
					) : (
						''
					),
				)}
			</select>
		</div>
	);
}
