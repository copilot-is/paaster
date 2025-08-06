import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-full bg-background p-6 flex flex-col rounded-lg shadow-sm items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <h3 className="mt-4 text-3xl text-gray-800 dark:text-gray-200">
        Not Found
      </h3>
      <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
        Content not found or has expired.
      </p>
      <Link
        href="/"
        className="mt-6 text-blue-500 hover:underline dark:text-blue-400"
      >
        Return Home
      </Link>
    </div>
  );
}
