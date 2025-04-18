import PassageController from "@/components/PassageController";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: PassageController,
});
