import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/add")({
  beforeLoad: () => {
    throw redirect({ to: "/enroll", replace: true });
  },
  component: () => null,
});
