import React from "react";
import { headers } from "../../messages/constants";
import "./styles.css";
import Lottie from "react-lottie";
import warningAnimation from "../../assets/Lottie/Warning.json";
import logo from "../../assets/Resources/4i_Blue Logo with GPTW-01-01.svg";
import { ButtonComponent } from "../ButtonComponent/ButtonComponent";

export const TestSubmissionConfirmation = ({ cancel, submit }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: warningAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidyMid slice",
    },
  };

  return (
    <div className="overlay-container-new">
      <div className="overlap-group-new">
        <div className="header">
          <img className="logo" alt="4i Logo" src={logo} />
          <p className="p-new">{headers.mainHeader}</p>
        </div>
        <div className="rectangle-new">
          <Lottie options={defaultOptions} height={160} width={160} />
        </div>
        <div className="div-new">
          You have not answered some questions. Are you sure you want to
          complete the test ?
        </div>
        <div className="text-wrapper-2-new">
          <ButtonComponent
            onClick={(e) => cancel()}
            name={"Cancel"}
            variant={"outline-danger"}
          />
          <ButtonComponent onClick={(e) => submit()} name={"Confirm"} />
        </div>
      </div>
    </div>
  );
};
