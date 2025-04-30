import React, { useState } from "react";
import "./Navbar.css";
import { GoHomeFill } from "react-icons/go";
import { IoIosNotifications } from "react-icons/io";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaCity } from "react-icons/fa6";
import { Link } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";

const Navbar = () => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <div className="Navbar">
      <Link to="/">
        <GoHomeFill className="icon icon-fill" />
      </Link>
      <Link to="/city">
        <FaCity className="icon" />
      </Link>
      <BiSolidMessageSquareDetail className="icon" />
      <IoIosNotifications className="icon" />
      <RiSettings5Fill
        className="icon"
        onClick={() => setModalOpened(true)}
      />
      <ProfileModal
        modalOpened={modalOpened}
        setModalOpened={setModalOpened}
      />
    </div>
  );
};

export default Navbar;