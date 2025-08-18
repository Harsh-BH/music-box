import NavBar from "./components/NavBar";
import HeroSection from "./sections/HeroSection";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import MessageSection from "./sections/MessageSection";
import FlavorSection from "./sections/FlavorSection";
import { useGSAP } from "@gsap/react";
import NutritionSection from "./sections/NutritionSection";
import BenefitSection from "./sections/BenefitSection";
import TestimonialSection from "./sections/TestimonialSection";
import FooterSection from "./sections/FooterSection";
import LeaderboardPage from "./pages/LeaderboardPage";
import MusicBrowsePage from "./pages/MusicBrowsePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const HomePage = () => {
  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
  });

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection />
          <MessageSection />
          <FlavorSection />
          <NutritionSection />
          <div>
            <BenefitSection />
            <TestimonialSection />
          </div>
          <FooterSection />
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <main>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/music" element={<MusicBrowsePage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
