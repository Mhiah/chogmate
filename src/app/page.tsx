"use client";

import dynamic from "next/dynamic";

// The town is WebGL, so it renders in the browser only.
const App = dynamic(() => import("@/components/App"), { ssr: false });

export default function Page() {
  return <App />;
}
