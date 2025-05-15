import React from "react";
import "./FollowersCard.css";
import { useAuth } from "../../Context/AuthContext";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import { Followers } from "../../Data/FollowersData";
import { Link } from "react-router-dom";
const FollowersCard = () => {
  const { usersData, isUsersLoading, userData } = useAuth();

  if (isUsersLoading) {
    return <div className="FollowersCard">Loading followers...</div>;
  }

  return (
    <div className="FollowersCard">
      <h3>Who is following you</h3>

      {usersData
        ?.filter((u) => u._id !== userData?._id)
        .slice(0, 6)
        .map((user, id) => {
          return (
            <div className="follower" key={id}>
              <div>
                <img
                  loading="lazy"
                  src={
                    user.avatarUrl
                      ? `https://graduation.amiralsayed.me${user.avatarUrl}`
                      : ProfileImage
                  }
                  alt="avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ProfileImage;
                  }}
                  className="followerImage"
                />
                <div className="name">
                  <span>
                    <Link to={`/user/${user.centralUsrId}`}>
                      {user.localUserName || user.userName}
                    </Link>
                  </span>
                  <span>@{user.userName}</span>
                </div>
              </div>
              <button className="button fc-button">Follow</button>
            </div>
          );
        })}
    </div>
  );
};

export default FollowersCard;
