import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { setTest } from "../../redux/features/test/testSlice";
import { setSection } from "../../redux/features/section/sectionSlice";
import { setQuery } from "../../redux/features/query/querySlice";
import { clearResponses } from "../../redux/features/response/responseSlice";
import { headers, messages } from "../../messages/constants";
import "./style.css";
import Lottie from "react-lottie";
import submitAnimation from "../../assets/Lottie/Submit.json";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Resources/4i_Blue Logo with GPTW-01-01.svg";
import { ButtonComponent } from "../ButtonComponent/ButtonComponent";

export const TestCompletionModal = () => {
  const [cookie, setCookie, removeCookie] = useCookies([
    "NAME",
    "CANDIDATE_ID",
    "TEST_ID",
    "TEST_KEY_NUM",
    "ANSWER_SHEET_HEADER_ID",
  ]);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleDone = (e) => {
    e.preventDefault();
    dispatch(setTest([]));
    dispatch(setSection([]));
    dispatch(clearResponses([]));
    dispatch(setQuery([]));

    removeCookie("TEST_ID");
    removeCookie("TEST_KEY_NUM");
    removeCookie("ANSWER_SHEET_HEADER_ID");
    removeCookie("CANDIDATE_ID");
    removeCookie("NAME");

    navigate("/login");
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: submitAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidyMid slice",
    },
  };

  return (
    <div className="overlay-container">
      <div className="overlap-group">
        <div className="header">
          <img className="logo" alt="4i Logo" src={logo} />
          <p className="p-new">{headers.mainHeader}</p>
        </div>
        <div className="rectangle-new">
          <Lottie options={defaultOptions} height={160} width={160} />
        </div>
        <div className="div">
          <p>{messages.testCompletionMessage1}</p>
          <p>{messages.testCompletionMessage2}</p>
          <p>{messages.testCompletionMessage3}</p>
        </div>
        <div className="text-wrapper-2">
          <ButtonComponent onClick={(e) => handleDone(e)} name={"Done"} />
        </div>
      </div>
    </div>
  );
};
