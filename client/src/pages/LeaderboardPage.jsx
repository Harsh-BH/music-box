import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useState } from "react";
import { topPerformers } from "../constants/leaderboardData";

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  
  useGSAP(() => {
    const titleSplit = SplitText.create(".leaderboard-title", {
      type: "chars",
    });

    gsap.from(titleSplit.chars, {
      yPercent: 100,
      stagger: 0.02,
      ease: "power2.out",
      delay: 0.5,
    });
    
    gsap.from(".leaderboard-card", {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      ease: "power2.out",
      delay: 1,
    });
  });
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    gsap.fromTo(
      ".leaderboard-card",
      { y: 20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.2,
      }
    );
  };

  return (
    <section className="bg-[#faeade] min-h-screen py-32 px-5 md:px-10">
      <div className="container mx-auto">
        <div className="overflow-hidden mb-20">
          <h1 className="leaderboard-title general-title text-center text-dark-brown">Global Leaderboards</h1>
        </div>
        
        <div className="flex justify-center gap-4 md:gap-8 mb-16">
          <TabButton 
            label="Weekly" 
            isActive={activeTab === 'weekly'} 
            onClick={() => handleTabChange('weekly')} 
          />
          <TabButton 
            label="Monthly" 
            isActive={activeTab === 'monthly'} 
            onClick={() => handleTabChange('monthly')} 
          />
          <TabButton 
            label="All Time" 
            isActive={activeTab === 'allTime'} 
            onClick={() => handleTabChange('allTime')} 
          />
          <TabButton 
            label="Trending" 
            isActive={activeTab === 'trending'} 
            onClick={() => handleTabChange('trending')} 
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-12 text-dark-brown font-paragraph font-medium py-4 px-6">
            <div className="col-span-1 md:col-span-1">#</div>
            <div className="col-span-5 md:col-span-3">Singer</div>
            <div className="hidden md:block md:col-span-3">Best Performance</div>
            <div className="col-span-3 md:col-span-2">Score</div>
            <div className="col-span-3 md:col-span-2">Earnings</div>
            <div className="hidden md:block md:col-span-1">Play</div>
          </div>
          
          {topPerformers.map((performer, index) => (
            <div 
              key={index} 
              className="leaderboard-card bg-milk/80 shadow-md backdrop-blur-md rounded-lg py-4 px-6 hover:bg-yellow-brown/10 transition-all duration-300 grid grid-cols-12 items-center"
            >
              <div className="col-span-1 md:col-span-1 font-bold text-xl text-dark-brown">
                {index + 1}
              </div>
              
              <div className="col-span-5 md:col-span-3 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img 
                    src={performer.avatar} 
                    alt={performer.name}
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div>
                  <p className="font-medium text-dark-brown">{performer.name}</p>
                  <p className="text-sm text-dark-brown/70">{performer.nftCount} NFTs</p>
                </div>
              </div>
              
              <div className="hidden md:block md:col-span-3">
                <p className="font-medium text-dark-brown">{performer.bestSong}</p>
                <p className="text-sm text-dark-brown/70">{performer.genre}</p>
              </div>
              
              <div className="col-span-3 md:col-span-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path 
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#d4be9c"
                        strokeWidth="2"
                      />
                      <path 
                        className="circle"
                        strokeDasharray={`${performer.score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a26833"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <text x="18" y="20.35" className="percentage">{performer.score}</text>
                    </svg>
                  </div>
                  <span className="ml-2 font-bold text-dark-brown">{performer.score}%</span>
                </div>
              </div>
              
              <div className="col-span-3 md:col-span-2 text-dark-brown font-medium">
                <div className="flex items-center gap-2">
                  <img src="/images/eth-icon.svg" alt="ETH" className="w-4 h-4" />
                  <span>{performer.earnings} ETH</span>
                </div>
              </div>
              
              <div className="hidden md:flex md:col-span-1 justify-center">
                <button className="w-10 h-10 rounded-full bg-yellow-brown/40 flex items-center justify-center hover:bg-yellow-brown transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-dark-brown" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center">
          <button className="hero-button">
            <p>View More</p>
          </button>
        </div>
      </div>
    </section>
  );
};

// Tab button component
const TabButton = ({ label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-yellow-brown text-milk' 
          : 'bg-dark-brown/10 text-dark-brown hover:bg-dark-brown/20'
      }`}
    >
      {label}
    </button>
  );
};

export default LeaderboardPage;
