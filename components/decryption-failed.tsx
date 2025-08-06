"use client";

import Link from "next/link";

export default function DecryptionFailed({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="h-full bg-background p-2 sm:p-6 flex flex-col rounded-lg shadow-sm">
      <div className="h-full flex flex-col items-center justify-center">
        <h3 className="text-3xl text-gray-800 dark:text-gray-200">Error</h3>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          {children}
        </p>
        <Link
          href="/"
          className="mt-6 text-blue-500 hover:underline dark:text-blue-400"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
