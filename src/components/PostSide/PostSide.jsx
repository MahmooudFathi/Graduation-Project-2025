import React from "react";
import Posts from "../Posts/Posts";
import PostShare from "../PostShare/PostShare";
import "./PostSide.css";
import { useLocation } from "react-router-dom";
const PostSide = ({ userId }) => {
  const location = useLocation();
  const scope = location.pathname === "/city" ? "admin" : "user";

  return (
    <div className="PostSide">
      {!userId && <PostShare scope={scope} />}
      <Posts scope={scope} userId={userId} />
    </div>
  );
};

export default PostSide;
