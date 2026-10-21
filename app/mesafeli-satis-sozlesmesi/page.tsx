import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("mesafeli-satis-sozlesmesi");

export default function Page() {
  return <LegalPageView slug="mesafeli-satis-sozlesmesi" />;
}
