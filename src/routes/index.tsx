import { createFileRoute } from "@tanstack/react-router";
import { WakaApp } from "@/components/waka/app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <WakaApp />;
}
