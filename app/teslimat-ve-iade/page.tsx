import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("teslimat-ve-iade");

export default function Page() {
  return <LegalPageView slug="teslimat-ve-iade" />;
}
