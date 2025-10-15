export const dynamic = "force-dynamic";

import TermsClient from "./TermsClient";
import type { TSnsType } from "../login/actions";

type TermsPageProps = {
  searchParams: {
    provider?: TSnsType;
  };
};

export default function TermsPage({ searchParams }: TermsPageProps) {
  const provider = searchParams?.provider as TSnsType | undefined;
  return <TermsClient initialProvider={provider} />;
} 
