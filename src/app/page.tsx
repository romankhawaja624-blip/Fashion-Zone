import { HomePage } from "@/components/home/HomePage";
import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main className="home-page">
        <HomePage />
      </main>
      <PublicFooter />
    </>
  );
}