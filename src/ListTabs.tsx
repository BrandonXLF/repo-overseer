import classNames from "classnames";
import { useEffect, useState } from "react";
import './ListTabs.css';

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

const defaultStateFilter = states[0].filter;

export default function ListTabs({ onTypeFilterSet, onStateFilterSet }: Readonly<{
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
	
	return <div id="tabs">
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
			defaultValue={defaultStateFilter}
			onChange={e => onStateFilterSet(e.target.value)}
		>
			{states.map(state => <option key={state.filter} value={state.filter}>
				{state.name}
			</option>)}
		</select>
	</div>;
}