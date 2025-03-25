import React from "react";
import Cover from "../../img/cover.jpg";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import "./ProfileCard.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function formatUsername(username) {
  if (!username) return ""; // تجنب الأخطاء عند تمرير قيمة فارغة

  // تحويل أول حرف في كل كلمة إلى حرف كبير
  let formattedUsername = username
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // حذف الأرقام في نهاية النص فقط
  formattedUsername = formattedUsername.replace(/\d+$/, "");

  return formattedUsername;
}

const ProfileCard = ({ location }) => {
  const { userData } = useAuth();
  if (!userData) return <p>Loading...</p>;

  return (
    <div className="ProfileCard">
      <div className="ProfileImages">
        <img src={
            userData.avatarUrl
              ? `https://graduation.amiralsayed.me${userData.coverUrl}`
              : Cover
          }
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = Cover;
          }} />
        <img
          src={
            userData.avatarUrl
              ? `https://graduation.amiralsayed.me${userData.avatarUrl}`
              : ProfileImage
          }
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ProfileImage;
          }}
        />
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
          

          {location !== "profilePage" && (
            <>
              <div className="vl"></div>
              <div className="follow">
                <span>{userData.posts.length}</span>
                <span>Posts</span>
              </div>
            </>
          )}
        </div>
        <hr />
      </div>
      {location !== "profilePage" && (
        <span>
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