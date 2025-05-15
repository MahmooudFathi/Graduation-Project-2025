import React from "react";
import InfoCard from "../InfoCard/InfoCard";
import LogoSearch from "../LogoSearch/LogoSearch";
import "../ProfileSide/ProfileSide.css";
const ProfileLeft = ({ user }) => {
  return (
    <div className="ProfileSide">
      <LogoSearch />
      <InfoCard user={user} />
    </div>
  );
};

export default ProfileLeft;
