import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="border p-5">
      <ul className="flex justify-between">
        <li className="mr-3">
          <Link
            className="inline-block rounded border border-blue-500 bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
            href="/"
          >
            Home
          </Link>
        </li>
        <li className="mr-3">
          <Link
            className="inline-block rounded border border-blue-500 bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
            href="/history"
          >
            History
          </Link>
        </li>
        <li className="mr-3">
          <a
            className="inline-block rounded border border-white px-4 py-2 text-blue-500 hover:border-gray-200 hover:bg-gray-200"
            href="#"
          >
            Pill
          </a>
        </li>
        <li className="mr-3">
          <a
            className="inline-block cursor-not-allowed px-4 py-2 text-gray-400"
            href="#"
          >
            Disabled Pill
          </a>
        </li>
      </ul>
    </nav>
  );
}
