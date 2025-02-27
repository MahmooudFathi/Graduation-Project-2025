import React from "react";
import Logo from "../../img/logo.png";
import { CiSearch } from "react-icons/ci";
import "./LogoSearch.css";
const LogoSearch = () => {
  return (
    <div className="LogoSearch">
      <img src={Logo} alt="" />
      <div className="Search">
        <input type="text" placeholder="#Explore" />
        <div className="s-icon">
          <CiSearch className="icon"/>
        </div>
      </div>
    </div>
  );
};

export default LogoSearch;
