import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SubjectGrid from "@/components/SubjectGrid";
import GamePreview from "@/components/GamePreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SubjectGrid />
        <GamePreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
