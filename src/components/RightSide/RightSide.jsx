import React, { useState } from "react";
import FollowersCard from "../FollowersCard/FollowersCard";
import ShareModal from "../ShareModal/ShareModal";
import "./RightSide.css";

const RightSide = ({ user }) => {
  const [modalShareOpened, setModalShareOpened] = useState(false);

  return (
    <div className="RightSide">
      <FollowersCard user={user} />

      <button
        className="button r-button"
        onClick={() => setModalShareOpened(true)}
      >
        Share
      </button>
      <ShareModal
        modalShareOpened={modalShareOpened}
        setModalShareOpened={setModalShareOpened}
      />
    </div>
  );
};

export default RightSide;
