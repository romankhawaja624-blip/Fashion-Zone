import { FalconHero } from "@/components/home/FalconHero";
import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main className="home-page">
        <FalconHero />
      </main>
      <PublicFooter />
    </>
  );
}