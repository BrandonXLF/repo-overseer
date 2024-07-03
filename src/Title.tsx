import './Title.css';

export default function Title() {
	return (
		<hgroup>
			<h1>
				<img src="logo-half.png" className="logo" alt="Repo Overseer logo" />
				<span>Repo Overseer</span>
			</h1>
			<p>View issues and pull requests in all your GitHub repositories.</p>
		</hgroup>
	);
}
