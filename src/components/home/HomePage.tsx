import { AudienceGateway } from "@/components/home/AudienceGateway";
import { BrandPhilosophy } from "@/components/home/BrandPhilosophy";
import { ClosingManifesto } from "@/components/home/ClosingManifesto";
import { DigitalAtelierPreview } from "@/components/home/DigitalAtelierPreview";
import { FalconAIStylist } from "@/components/home/FalconAIStylist";
import { FalconHero } from "@/components/home/FalconHero";
import { ProductRail } from "@/components/home/ProductRail";

export function HomePage() {
  return (
    <>
      <FalconHero />
      <AudienceGateway />
      <ProductRail />
      <BrandPhilosophy />
      <FalconAIStylist />
      <DigitalAtelierPreview />
      <ClosingManifesto />
    </>
  );
}
