import React from "react";
import "./style.css";
import Lottie from "react-lottie";
import loaderAnimation from "../../assets/Lottie/Loader.json";

export const Loader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loaderAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidyMid slice",
    },
  };

  return (
    <div className="overlay-container">
      <div className="frame">
        <div className="overlap">
          <div className="loader">
            <Lottie options={defaultOptions} height={180} width={180} />
          </div>
        </div>
      </div>
    </div>
  );
};
