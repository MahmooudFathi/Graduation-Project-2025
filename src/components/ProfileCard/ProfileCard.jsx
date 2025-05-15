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

const ProfileCard = ({ location, user }) => {
  const { userData } = useAuth();
  const profileUser = user || userData;
  const isProfilePage = location === "profilePage";
  if (!profileUser) return <p>Loading...</p>;
  if (!userData) return <p>Loading...</p>;

  return (
    <div className={`ProfileCard ${isProfilePage ? "profilePage" : ""}`}>
      <div className="ProfileImages">
        <img
          loading="lazy"
          src={
            profileUser.coverUrl
              ? `https://graduation.amiralsayed.me${profileUser.coverUrl}`
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
              profileUser.avatarUrl
                ? `https://graduation.amiralsayed.me${profileUser.avatarUrl}`
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
        {isProfilePage ? (
          <span>{formatUsername(profileUser.localUserName)}</span>
        ) : (
          <Link
            to={`/users/${profileUser.centralUsrId}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span>{formatUsername(profileUser.localUserName)}</span>
          </Link>
        )}
        <span>{profileUser.bio || "No bio available"}</span>
      </div>

      <div className="followStatus">
        <hr />
        <div>
          <div className="follow">
            <span>{profileUser.friends?.length ?? 0}</span>
            <span>Friends</span>
          </div>

          {!isProfilePage && (
            <>
              <div className="vl"></div>
              <div className="follow">
                <span>{profileUser.posts?.length ?? 0}</span>
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
