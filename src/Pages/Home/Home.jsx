import React, { useEffect, useState } from "react";
import PostSide from "../../components/PostSide/PostSide";
import RightSide from "../../components/RightSide/RightSide";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";
import LogoSearch from "../../components/LogoSearch/LogoSearch";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      {isMobile && <Navbar />}
      <div className="Home">
        <div className="ProfileSide">
          <LogoSearch />
          <ProfileCard location="homepage" />
        </div>
        <PostSide />
        <div className="RightSide">
          {!isMobile && <Navbar />}
          <RightSide />
        </div>
      </div>
    </>
  );
};

export default Home;
