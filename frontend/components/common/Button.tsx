import React, { ReactNode } from "react";

type Props = {
  children: ReactNode | ReactNode[];
};

export default function Button({ children }: Props) {
  return (
    <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
      {children}
    </button>
  );
}
