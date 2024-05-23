import React from "react";
import { headers } from "../../messages/constants";
import logo from "../../assets/Resources/4i_Blue Logo with GPTW-01-01.svg";
import "./NavbarComponent.css";
import { useCookies } from "react-cookie";

export const NavbarComponent = () => {
  const [cookie, setCookie] = useCookies();

  const user = cookie.NAME;

  return (
    <div className="navbar">
      <div className="image">
        <img alt="4i Logo" src={logo} />
      </div>
      <div className="text-wrapper">{headers.mainHeader}</div>
      <div className="text-wrapper-sm">Candidate Name: {user}</div>
    </div>
  );
};
