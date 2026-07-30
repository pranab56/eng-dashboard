import { Suspense } from "react";
import Tournaments from "./Tournaments";

export const dynamic = 'force-dynamic';

export default function page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading...</div>}>
      <Tournaments />
    </Suspense>
  );
}
