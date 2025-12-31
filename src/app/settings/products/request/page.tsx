import RequestPageClient from "./component/RequestPageClient";
import { SubmitProvider } from "@/contexts/ReaquestContext";

export default function RequestPage() {
  return (
    <SubmitProvider>
      <RequestPageClient />
    </SubmitProvider>
  );
}
