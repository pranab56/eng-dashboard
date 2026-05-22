import { Suspense } from "react";
import CreateLeague from "./CreateLeague";

export default function page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading...</div>}>
      <CreateLeague />
    </Suspense>
  );
}
