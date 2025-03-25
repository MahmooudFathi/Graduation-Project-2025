import React, { useState } from "react";
import "./RightSide.css";
import { GoHomeFill } from "react-icons/go";
import { IoIosNotifications } from "react-icons/io";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaCity } from "react-icons/fa6";
import TrendCard from "../TrendCard/TrendCard";
import ShareModal from "../ShareModal/ShareModal";
import { Link } from "react-router-dom";

const RightSide = () => {
  const [modalOpened, setModalOpened] = useState(false);
  return (
    <div className="RightSide">
      <div className="navIcons">
        <Link to="/"> 
        <GoHomeFill className="icon icon-fill" />
        </Link>
        <Link to="/city">
        <FaCity className="icon"/>
        </Link>
        <BiSolidMessageSquareDetail className="icon" />
        <IoIosNotifications className="icon" />
        <RiSettings5Fill className="icon" />
      </div>

      <TrendCard />

      <button className="button r-button" onClick={() => setModalOpened(true)}>
        Share
      </button>
      <ShareModal modalOpened={modalOpened} setModalOpened={setModalOpened} />
    </div>
  );
};

export default RightSide;
