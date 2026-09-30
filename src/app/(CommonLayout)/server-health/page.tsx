import React from "react";
import ServerHealth from "./ServerHealth";

export const metadata = {
  title: "Server Health | ENG Dashboard",
  description: "Real-time system telemetry and server diagnostics",
};

export default function ServerHealthPage() {
  return <ServerHealth />;
}
