import { createFileRoute } from "@tanstack/react-router";
import { RedirectPage } from "@/components/redirect-page";

export const Route = createFileRoute("/$code")({
  ssr: false,
  component: ShortRedirect,
});

function ShortRedirect() {
  const { code } = Route.useParams();
  return <RedirectPage code={code} />;
}
