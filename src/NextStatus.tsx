import ErrorDetails from './ErrorDetails';
import { RequestStatus } from './ListArea';

export default function NextStatus({
	status,
}: Readonly<{ status: RequestStatus | undefined }>) {
	switch (status?.state) {
		case 'loading':
			return <div>Loading...</div>;
		case 'error':
			return <ErrorDetails error={status.error} reset={status.reset} />;
		case undefined:
			return null;
	}
}
