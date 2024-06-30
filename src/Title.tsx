import './Title.css';

export default function Title() {
	return <hgroup>
		<h1>
			<div className="css-logo" />
			<span>Repo Overseer</span>
		</h1>
		<p>View issues and pull requests in all your GitHub repositories.</p>
	</hgroup>;
}