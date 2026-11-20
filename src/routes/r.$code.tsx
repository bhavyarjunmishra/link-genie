import { createFileRoute } from "@tanstack/react-router";
import { RedirectPage } from "@/components/redirect-page";

export const Route = createFileRoute("/r/$code")({
  ssr: false,
  component: LegacyRedirect,
});

function LegacyRedirect() {
  const { code } = Route.useParams();
  return <RedirectPage code={code} />;
}
