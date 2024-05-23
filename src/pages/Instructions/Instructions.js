import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import axios from "axios";
import "./style.css";
import { API_URL } from "../../api/api";
import { QuestionComponent } from "../../components/QuestionsComponent/QuestionsComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  responseSelector,
  setResponse,
} from "../../redux/features/response/responseSlice";
import {
  rules,
  messages,
  buttons,
  welcomeMessages,
  headers,
} from "../../messages/constants";
import { Loader } from "../../components/PageLoader/PageLoader";
import { ButtonComponent } from "../../components/ButtonComponent/ButtonComponent";

export const Instructions = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const response = useSelector(responseSelector);

  const [cookie, setCookie] = useCookies([
    "CANDIDATE_ID",
    "TEST_ID",
    "TEST_KEY_NUM",
    "ANSWER_SHEET_HEADER_ID",
  ]);

  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [topicNames, setTopicNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testDuration, setTestDuration] = useState(0);

  const testId = cookie.TEST_ID;

  const fetchDetails = async () => {
    try {
      const response = await axios.post(`${API_URL}/fetchsections`, {
        TEST_ID: cookie.TEST_ID,
        CANDIDATE_ID: cookie.CANDIDATE_ID,
      });
      const testResponse = await axios.post(`${API_URL}/testinfo`, {
        TEST_ID: testId,
      });
      setTestDuration(testResponse.data.data.TEST_DURATION);
      setTopicNames(response.data.data);
    } catch (error) {
      console.log("Error in Instructions page: ", error);
    }
  };

  const fetchExistingResponses = async () => {
    if (cookie.ANSWER_SHEET_HEADER_ID != null) {
      try {
        const response = await axios.post(`${API_URL}/fetchanswersheet`, {
          ANSWER_SHEET_HEADER_ID: cookie.ANSWER_SHEET_HEADER_ID,
        });
        const responseData = response.data.data;
        responseData.forEach((item) => {
          if (item.TEST_ANSWER_ID !== null || item.DESCRIPTIVE_ANSWER !== "")
            dispatch(
              setResponse({
                queryId: item.TEST_QUERY_ID,
                answerId: item.TEST_ANSWER_ID,
                sectionId: item.TEST_SECTION_ID,
                descresponse: item.DESCRIPTIVE_ANSWER,
                isFlagged: item.FLAG,
              })
            );
        });
        navigate("/test");
      } catch (error) {
        console.log("Error fetching existing answers: ", error);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchExistingResponses();
  }, []);

  const termsButton = () => {
    if (document.getElementById("termsBox").checked) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const startTest = async () => {
    setButtonDisabled(true);
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/createanswersheet`, {
        CANDIDATE_ID: cookie.CANDIDATE_ID,
        TEST_ID: cookie.TEST_ID,
      });
      if (
        cookie.ANSWER_SHEET_HEADER_ID === null ||
        cookie.ANSWER_SHEET_HEADER_ID === undefined
      ) {
        setCookie(
          "ANSWER_SHEET_HEADER_ID",
          response.data.data.ANSWER_SHEET_HEADER_ID,
          {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
          }
        );
      }
      toast.success("All the Best!");
      navigate("/test");
    } catch (error) {
      console.log("Error at creating answer sheet: ", error);
    }
  };

  return (
    <div className="intro-body">
      <div className="main-card">
        <div className="card-body">
          {loading && <Loader />}
          <p className="greetingMsg">
            {messages.greetingMsg} {cookie.NAME},
          </p>
          <div className="mb-3">
            {welcomeMessages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
            <p className="test-guidelines">{headers.rules}</p>
            <ul className="ruleList">
              {rules.map((rule, index) => (
                <li key={index}>{`${rule}`}</li>
              ))}
            </ul>
            <div className="instruction-cards">
              <div className="card sub-card">
                <div className="card-body">
                  {topicNames.map((id, index) => (
                    <React.Fragment key={id._id.testSection}>
                      <a>
                        <b>Section {String.fromCharCode(65 + index)}: </b>
                        {id._id.topicName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </a>
                      {index !== topicNames.length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </div>
                <div className="card-body" style={{ paddingTop: "0px" }}>
                  <b>Duration: </b>
                  {testDuration} minutes
                </div>
              </div>
            </div>
          </div>
          <div className="legend card card-body">
            <div className="legend-items">
              <div className="legend-item">
                <QuestionComponent
                  questionNumber="1"
                  isAnswered={false}
                  isActive={false}
                />{" "}
                Un-Answered Question
              </div>
              <div className="legend-item">
                <QuestionComponent questionNumber="1" isAnswered={true} />{" "}
                Answered Question
              </div>
              <div className="legend-item">
                <QuestionComponent questionNumber="1" isFlagged={true} />{" "}
                Flagged Question
              </div>
              <div className="legend-item">
                <QuestionComponent questionNumber="1" isActive={true} /> Current
                Question
              </div>
            </div>
          </div>
          <div className="checkbox-div">
            <input
              type="checkbox"
              className="checkbox-input"
              id="termsBox"
              onClick={termsButton}
            ></input>
            <p className="termsMsg">{messages.termsMsg}</p>
          </div>
        </div>
        <div className="next-button">
          <ButtonComponent
            id="nextBtn"
            disabled={isButtonDisabled}
            onClick={startTest}
            name={buttons.nextButton}
            variant={"outline-primary"}
          />
        </div>
      </div>
    </div>
  );
};
