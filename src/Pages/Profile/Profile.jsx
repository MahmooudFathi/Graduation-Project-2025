import React, { useEffect, useState } from "react";
import PostSide from "../../components/PostSide/PostSide";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import ProfileLeft from "../../components/ProfileLeft/ProfileLeft";
import RightSide from "../../components/RightSide/RightSide";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";
const Profile = () => {
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
      <div className="Profile">
        <ProfileLeft />
        <div className="Profile-center">
          <ProfileCard location="profilePage" />
          <PostSide />
        </div>
        <div className="RightSide">
          {!isMobile && <Navbar />}
          <RightSide />
        </div>
      </div>
    </>
  );
};

export default Profile;
