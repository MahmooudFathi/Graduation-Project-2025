import React, { useEffect, useState } from "react";
import ProfileImage from "../../img/pngtree-male-avatar-vector-icon-png-image_691612.jpg";
import "./Navbar.css";
import { GoHomeFill } from "react-icons/go";
import { IoIosNotifications } from "react-icons/io";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaCity } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";
import { GiTeamUpgrade } from "react-icons/gi";
import { useColorMode, Button } from "@chakra-ui/react";
import { useAuth } from "../../Context/AuthContext";

const Navbar = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 768);
  const { colorMode, toggleColorMode } = useColorMode(); // ← hook الوضع
  const { userData } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("dark", colorMode === "dark");
  }, [colorMode]);

  return (
    <div className="Navbar">
      {isTablet && (
        <Link to="/profile">
          <img
            loading="lazy"
            src={
              userData?.avatarUrl
                ? `https://graduation.amiralsayed.me${userData.avatarUrl}`
                : ProfileImage
            }
            alt="Profile"
            className="ProfileImage3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ProfileImage;
            }}
          />
        </Link>
      )}
      <Link to="/">
        <GoHomeFill
          className={`icon icon-fill ${
            currentPath === "/" ? "active-icon" : ""
          }`}
        />
      </Link>
      <Link to="/city">
        <FaCity
          className={`icon ${currentPath === "/city" ? "active-icon" : ""}`}
        />
      </Link>
      <BiSolidMessageSquareDetail className="icon" />
      <IoIosNotifications className="icon" />
      {userData?.role !== "user" && (
        <Link to="/role">
          <GiTeamUpgrade
            className={`icon ${currentPath === "/role" ? "active-icon" : ""}`}
          />
        </Link>
      )}
      <RiSettings5Fill
        className={`icon ${currentPath === "/settings" ? "active-icon" : ""}`}
        onClick={() => setModalOpened(true)}
      />
      <Button
        size="sm"
        onClick={toggleColorMode}
        className="dark-mode-toggle"
        // colorScheme="teal"
        // variant="ghost"
      >
        {colorMode === "light" ? "🌙" : "☀️"}
      </Button>
      <ProfileModal modalOpened={modalOpened} setModalOpened={setModalOpened} />
    </div>
  );
};

export default Navbar;
