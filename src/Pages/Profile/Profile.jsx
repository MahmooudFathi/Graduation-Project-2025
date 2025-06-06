import React, { useEffect, useState } from "react";
import PostSide from "../../components/PostSide/PostSide";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import ProfileLeft from "../../components/ProfileLeft/ProfileLeft";
import RightSide from "../../components/RightSide/RightSide";
import Navbar from "../../components/Navbar/Navbar";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 768);
  const { userId } = useParams(); // لو معنديش userId معناها ده بروفايلي أنا
  const { user, userData } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userProfile", userId || "me"],
    queryFn: async () => {
      const endpoint = userId
        ? `https://graduation.amiralsayed.me/api/users/${userId}`
        : `https://graduation.amiralsayed.me/api/users/me`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return response.data;
    },
    enabled: !!user?.token, // بس نطلب البيانات لو userId موجود
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      setIsTablet(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // في حالة تحميل البيانات من API
  if (isLoading) return <p>Loading profile...</p>;
  if (error) return <p>Error loading profile</p>;

  // نحدد المستخدم اللي هنعرض بياناته
  const userProfile = userId ? data : userData;
  return (
    <>
      {isMobile && <Navbar />}
      <div className="Profile">
        {!isTablet && <ProfileLeft user={userProfile} />}
        <div className="Profile-center">
          <ProfileCard user={userProfile} location="profilePage" />
          <PostSide userId={userProfile.centralUsrId} />
        </div>
        <div className="RightSide">
          {!isMobile && <Navbar />}
          <RightSide user={userProfile} />
        </div>
      </div>
    </>
  );
};

export default Profile;
