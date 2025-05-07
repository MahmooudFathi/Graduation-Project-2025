import React, { useEffect, useState } from "react";
import PostSide from "../../components/PostSide/PostSide";
import RightSide from "../../components/RightSide/RightSide";
import Navbar from "../../components/Navbar/Navbar";
import LogoSearch from "../../components/LogoSearch/LogoSearch";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import "../Home/Home.css";
const City = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      setIsTablet(window.innerWidth <= 768);
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
          {!isTablet && <ProfileCard location="homepage" />}
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

export default City;
