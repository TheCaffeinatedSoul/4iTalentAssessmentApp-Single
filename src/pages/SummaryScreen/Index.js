import React, { useEffect, useState } from "react";
import {
  clearResponses,
  responseSelector,
  setResponse,
} from "../../redux/features/response/responseSlice";
import { setTest, testSelector } from "../../redux/features/test/testSlice";
import { ButtonComponent } from "../../components/ButtonComponent/ButtonComponent";
import { QuestionComponent } from "../../components/QuestionsComponent/QuestionsComponent";
import { TestCompletionModal } from "../../components/TestCompletionModal/TestCompletionModal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { API_URL } from "../../api/api";
import axios from "axios";
import "./style.css";
import { buttons } from "../../messages/constants";
import { setSection } from "../../redux/features/section/sectionSlice";
import { setQuery } from "../../redux/features/query/querySlice";
import { Loader } from "../../components/PageLoader/PageLoader";
import { TestSubmissionConfirmation } from "../../components/TestSubmissionConfirmation/TestSubmissionConfirmation";

export const temporaryStorage = {};

export const SummaryScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [cookie, setCookie, removeCookie] = useCookies([
    "NAME",
    "CANDIDATE_ID",
    "TEST_ID",
    "TEST_KEY_NUM",
    "ANSWER_SHEET_HEADER_ID",
  ]);

  const dispatch = useDispatch();

  const test = useSelector(testSelector);
  const response = useSelector(responseSelector);

  const testId = cookie.TEST_ID;
  const candidateId = cookie.CANDIDATE_ID;

  const totalQuestions = test[0]?.reduce(
    (count, testSection) => count + testSection.queries.length,
    0
  );

  let flaggedQuestions = 0;
  let unansweredQuestions =
    totalQuestions -
    response.filter(
      (r) =>
        r.answerId ||
        (r?.descresponse !== undefined &&
          r?.descresponse !== null &&
          r?.descresponse !== "")
    ).length;

  const [showModal, setShowModal] = useState(false);

  const gotoTestPart = () => {
    const sectionLength = test[0].length;
    const questionsLength = test[0][sectionLength - 1].queries.length;
    temporaryStorage[0] = [];
    temporaryStorage[0].push({
      sectionIndex: sectionLength - 1,
      questionIndex: questionsLength - 1,
    });
    setLoading(true);
    navigate("/test");
  };

  const onQuestionClick = (questionNumber, sectionIndex) => {
    temporaryStorage[0] = [];
    temporaryStorage[0].push({
      sectionIndex: sectionIndex,
      questionIndex: questionNumber - 1,
    });
    setLoading(true);
    navigate("/test");
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (unansweredQuestions > 0) {
      setConfirmation(true);
    } else {
      await handleSubmit();
    }
  };

  const handleCancel = () => {
    setConfirmation(false);
    setShowModal(false);
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      setConfirmation(false);
      setLoading(true);
      const finishData = await axios.post(`${API_URL}/testcompleted`, {
        TEST_ID: cookie.TEST_ID,
        CANDIDATE_ID: cookie.CANDIDATE_ID,
      });
      const ASH_ID = cookie.ANSWER_SHEET_HEADER_ID;
      const evalData = await axios.get(
        `${API_URL}/objective/evaluateobjective`,
        {
          params: { ashid: ASH_ID },
        }
      );
      setShowModal(true);

      setTimeout(() => {
        setLoading(false);
        navigate("/login");

        dispatch(setTest([]));
        dispatch(setSection([]));
        dispatch(clearResponses([]));
        dispatch(setQuery([]));

        removeCookie("TEST_ID");
        removeCookie("TEST_KEY_NUM");
        removeCookie("ANSWER_SHEET_HEADER_ID");
        removeCookie("CANDIDATE_ID");
        removeCookie("NAME");
      }, 15000);
    } catch (error) {
      setLoading(false);
      console.log("Error recording responses in db: ", error);
    }
  };

  const fetchTest = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/fetchtest`, {
        TEST_ID: testId,
        CANDIDATE_ID: candidateId,
      });
      dispatch(setTest(response.data.data));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const fetchExistingResponses = async () => {
    await fetchTest();
    if (cookie.ANSWER_SHEET_HEADER_ID != null) {
      try {
        const response = await axios.post(`${API_URL}/fetchanswersheet`, {
          ANSWER_SHEET_HEADER_ID: cookie.ANSWER_SHEET_HEADER_ID,
        });
        const responseData = response.data.data;
        responseData.forEach((item) => {
          if (item.TEST_ANSWER_ID !== null) {
            dispatch(
              setResponse({
                queryId: item.TEST_QUERY_ID,
                answerId: item.TEST_ANSWER_ID[0],
                sectionId: item.TEST_SECTION_ID,
                descresponse: item.DESCRIPTIVE_ANSWER,
                isFlagged: item.FLAG,
              })
            );
          } else if (item.descresponse !== "") {
            dispatch(
              setResponse({
                queryId: item.TEST_QUERY_ID,
                answerId: null,
                sectionId: item.TEST_SECTION_ID,
                descresponse: item.DESCRIPTIVE_ANSWER,
                isFlagged: item.FLAG,
              })
            );
          }
        });
      } catch (error) {
        console.log("Error fetching existing answers: ", error);
      }
    }
  };

  const getSummaryData = () => {
    const summaryData = [];
    test[0]?.forEach((section) => {
      const summarySection = {
        sectionName: section._id.topicName,
        sectionId: section._id.testSection,
        queries: [],
      };
      section.queries.forEach((query) => {
        const responseItem = response.find((r) => r.queryId === query.queryId);
        const isActive = responseItem !== undefined;
        const isFlagged = responseItem?.isFlagged;
        if (isFlagged) {
          flaggedQuestions += 1;
        }
        const summaryQuery = {
          queryId: query.queryId,
          questionNumber: query.questionNumber,
          query: query.query,
          answers: query.answers,
          isActive: isActive,
        };
        summarySection.queries.push(summaryQuery);
      });
      summaryData.push(summarySection);
    });
    return summaryData;
  };

  const summaryData = getSummaryData();

  useEffect(() => {
    fetchExistingResponses();
  }, []);

  return (
    <div className="summary-main-div">
      <div className="header-div">
        <h3>Summary</h3>
        <div className="sub-content">
          <p className="sections-sub-div">
            {
              response.filter(
                (r) =>
                  r.answerId ||
                  (r?.descresponse !== undefined &&
                    r?.descresponse !== null &&
                    r?.descresponse !== "")
              ).length
            }{" "}
            out of {totalQuestions}{" "}
            {response.filter(
              (r) =>
                r.answerId &&
                r?.descresponse !== undefined &&
                r?.descresponse !== null &&
                r?.descresponse !== ""
            ).length !== 1
              ? "questions"
              : "question"}{" "}
            answered
          </p>
          <p className="sections-sub-div">|</p>
          <p className="flagged-count">
            {flaggedQuestions}{" "}
            {flaggedQuestions !== 1 ? "questions" : "question"} flagged
          </p>
          <p className="sections-sub-div">|</p>
          <p className="unanswered">
            {totalQuestions -
              response.filter(
                (r) =>
                  r.answerId ||
                  (r?.descresponse !== undefined &&
                    r?.descresponse !== null &&
                    r?.descresponse !== "")
              ).length}{" "}
            {totalQuestions -
              response.filter(
                (r) =>
                  r.answerId ||
                  (r?.descresponse !== undefined &&
                    r?.descresponse !== null &&
                    r?.descresponse !== "")
              ).length !==
            1
              ? "questions"
              : "question"}{" "}
            unanswered
          </p>
        </div>
      </div>
      <div className="summary-div">
        {summaryData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section-component-div">
            <div className="title-card">
              <p className="section-name">{`Section ${String.fromCharCode(
                65 + sectionIndex
              )}`}</p>
              <p className="title-name">{section.sectionName}</p>
            </div>
            <div className="question-component-div">
              {section.queries &&
                section.queries.map((query, queryIndex) => (
                  <QuestionComponent
                    key={queryIndex}
                    questionNumber={query.questionNumber}
                    queryId={query.queryId}
                    query={query.query}
                    isAnswered={
                      response.find(
                        (r) =>
                          r.queryId === query.queryId &&
                          (r.answerId ||
                            (r?.descresponse !== undefined &&
                              r?.descresponse !== null &&
                              r?.descresponse !== ""))
                      ) !== undefined
                    }
                    isFlagged={
                      response.find((r) => r.queryId === query.queryId)
                        ?.isFlagged
                    }
                    onClick={(e) =>
                      onQuestionClick(query.questionNumber, sectionIndex)
                    }
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="navigation-buttons">
        <ButtonComponent
          class="previous-btn"
          name={`${buttons.gobackButton}`}
          onClick={gotoTestPart}
        />

        <ButtonComponent
          class="submit-btn"
          name={`${buttons.submitButton}`}
          onClick={handleSubmitTest}
        />
      </div>
      {loading && <Loader />}
      {showModal && <TestCompletionModal />}
      {confirmation && (
        <TestSubmissionConfirmation
          cancel={handleCancel}
          submit={handleSubmit}
        />
      )}
    </div>
  );
};
