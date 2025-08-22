
export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
            <h1 className="text-4xl font-bold text-red-600">🚫 Unauthorized Access</h1>
            <p className="mt-4 text-gray-600">
                You do not have permission to view this page.
            </p>
            <a
                href="/"
                className="mt-6 inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
                Return to Home
            </a>
        </div>
    );
}