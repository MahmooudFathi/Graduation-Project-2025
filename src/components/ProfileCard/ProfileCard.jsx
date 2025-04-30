import React from "react";
import Cover from "../../img/cover.jpg";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import "./ProfileCard.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function formatUsername(username) {
  if (!username) return "";
  let formattedUsername = username
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return formattedUsername.replace(/\d+$/, "");
}

const ProfileCard = ({ location }) => {
  const { userData } = useAuth();
  if (!userData) return <p>Loading...</p>;

  const isProfilePage = location === "profilePage";

  return (
    <div className={`ProfileCard ${isProfilePage ? "profilePage" : ""}`}>
      <div className="ProfileImages">
        <img
          loading="lazy"
          src={
            userData.coverUrl
              ? `https://graduation.amiralsayed.me${userData.coverUrl}`
              : Cover
          }
          alt="Cover"
          className="CoverImage"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = Cover;
          }}
        />
        <div className="ProfilePicWrapper">
          <img
            loading="lazy"
            src={
              userData.avatarUrl
                ? `https://graduation.amiralsayed.me${userData.avatarUrl}`
                : ProfileImage
            }
            alt="Profile"
            className="ProfileImage"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ProfileImage;
            }}
          />
        </div>
      </div>

      <div className="ProfileName">
        <span>{formatUsername(userData.localUserName)}</span>
        <span>{userData.bio || "No bio available"}</span>
      </div>

      <div className="followStatus">
        <hr />
        <div>
          <div className="follow">
            <span>{userData.friends.length}</span>
            <span>Friends</span>
          </div>

          {!isProfilePage && (
            <>
              <div className="vl"></div>
              <div className="follow">
                <span>{userData.posts.length}</span>
                <span>Posts</span>
              </div>
            </>
          )}
        </div>
        {!isProfilePage && <hr />}
      </div>
      {!isProfilePage && (
        <span className="MyProfileLink">
          <Link
            to={`/profile`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            My Profile
          </Link>
        </span>
      )}
    </div>
  );
};

export default ProfileCard;
