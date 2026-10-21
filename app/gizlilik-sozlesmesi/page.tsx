import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("gizlilik-sozlesmesi");

export default function Page() {
  return <LegalPageView slug="gizlilik-sozlesmesi" />;
}
