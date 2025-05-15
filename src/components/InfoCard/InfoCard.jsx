import React, { useState } from "react";
import "./InfoCard.css";
import { GoPencil } from "react-icons/go";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useAuth } from "../../Context/AuthContext";

const InfoCard = ({ user }) => {
  const [modalOpened, setModalOpened] = useState(false);
  const { logout, userData } = useAuth();
  const isMyProfile = user?._id === userData?._id;

  return (
    <div className="InfoCard">
      <div className="infoHead">
        <h4>Your Info</h4>
        {isMyProfile && (
          <div>
            <GoPencil
              width="2rem"
              height="1.2rem"
              onClick={() => setModalOpened(true)}
            />
            <ProfileModal
              modalOpened={modalOpened}
              setModalOpened={setModalOpened}
            />
          </div>
        )}
      </div>

      <div className="info">
        <span>
          <b>Status </b>
        </span>
        <span>in Relationship</span>
      </div>

      <div className="info">
        <span>
          <b>Lives in </b>
        </span>
        <span>Multan</span>
      </div>

      <div className="info">
        <span>
          <b>Works at </b>
        </span>
        <span>Zainkeepscode inst</span>
      </div>
      {isMyProfile && (
        <button className="button logout-button" onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
};

export default InfoCard;
