import React, { useEffect, useState } from "react";
import { SectionComponent } from "../../components/SectionComponent/SectionComponent";
import { QuestionComponent } from "../../components/QuestionsComponent/QuestionsComponent";
import { ButtonComponent } from "../../components/ButtonComponent/ButtonComponent";
import { querySelector, setQuery } from "../../redux/features/query/querySlice";
import { setTest, testSelector } from "../../redux/features/test/testSlice";
import { CountdownTimer } from "../../components/Timer/CountdownTimer";
import { useDispatch, useSelector } from "react-redux";
import {
  sectionSelector,
  setSection,
} from "../../redux/features/section/sectionSlice";
import {
  clearResponses,
  flagQuestion,
  removeResponse,
  responseSelector,
  setResponse,
  unflagQuestion,
} from "../../redux/features/response/responseSlice";
import {
  MDXEditor,
  tablePlugin,
  thematicBreakPlugin,
  listsPlugin,
  headingsPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  maxLengthPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { PiFlagLight } from "react-icons/pi";
import RichTextEditor from "../../components/RichTextEditor/index";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { API_URL } from "../../api/api";
import axios from "axios";
import "./style.css";
import { buttons } from "../../messages/constants";
import { VscTrash } from "react-icons/vsc";
import { temporaryStorage } from "../SummaryScreen/Index";
import { Loader } from "../../components/PageLoader/PageLoader";
import { toast } from "react-toastify";

export const TestScreen = () => {
  const navigate = useNavigate();

  const [cookie, setCookie] = useCookies([
    "CANDIDATE_ID",
    "TEST_ID",
    "TEST_KEY_NUM",
  ]);
  const testId = cookie.TEST_ID;
  const candidateId = cookie.CANDIDATE_ID;
  const answerSheetHeaderId = cookie.ANSWER_SHEET_HEADER_ID;

  const dispatch = useDispatch();
  const test = useSelector(testSelector);
  const section = useSelector(sectionSelector);
  const question = useSelector(querySelector);
  const response = useSelector(responseSelector);
  const isFlagged = useSelector(
    (state) =>
      state.response.find((r) => r.queryId === question[0]?.queryId)
        ?.isFlagged === true
  );

  const [sectionNames, setSectionNames] = useState([]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mdxEditorKey, setMdxEditorKey] = useState(0);
  const [checkboxKey, setCheckboxKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  let tabSwitchCount = 0;

  const fetchTest = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/fetchtest`, {
        TEST_ID: testId,
        CANDIDATE_ID: candidateId,
      });
      dispatch(setTest(response.data.data));
      setSectionNames(
        response.data.data.map(
          (_, index) => `Section ${String.fromCharCode(65 + index)}`
        )
      );
      if (
        temporaryStorage === undefined ||
        temporaryStorage === null ||
        Object.keys(temporaryStorage).length === 0
      ) {
        dispatch(setSection(response.data.data[0]._id));
        dispatch(setQuery(response.data.data[0].queries[0]));
        setLoading(false);
      } else {
        dispatch(
          setSection(
            response.data.data[temporaryStorage[0][0].sectionIndex]._id
          )
        );
        dispatch(
          setQuery(
            response.data.data[temporaryStorage[0][0].sectionIndex].queries[
              temporaryStorage[0][0].questionIndex
            ]
          )
        );
        setCurrentSectionIndex(temporaryStorage[0][0].sectionIndex);
        setCurrentQuestionIndex(temporaryStorage[0][0].questionIndex);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const fetchASHData = async () => {
    if (cookie.ANSWER_SHEET_HEADER_ID !== null) {
      try {
        const response = await axios.post(`${API_URL}/fetchashdata`, {
          ANSWER_SHEET_HEADER_ID: answerSheetHeaderId,
        });
        tabSwitchCount = response.data.data.TAB_SWITCH_COUNT;
      } catch (error) {
        console.log("Error fetching Answer Sheet Header data: ", error);
      }
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
          } else {
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

  const updateResponseToDB = async () => {
    const currentItem = await response.find(
      (r) => r.queryId === question[0].queryId
    );
    const payload = {
      ANSWER_SHEET_HEADER_ID: answerSheetHeaderId,
      TEST_QUERY_ID: question[0].queryId,
      TEST_SECTION_ID: section[0].testSection,
      TEST_ANSWER_ID: currentItem?.answerId || null,
      DESCRIPTIVE_ANSWER: currentItem?.descresponse || "",
      CANDIDATE_ID: candidateId,
      FLAG: currentItem?.isFlagged,
    };
    try {
      const fillAnswer = await axios.post(`${API_URL}/fillanswers`, payload);
    } catch (error) {
      console.log("Error updating response to the database: ", error);
    }
  };

  const removeResponseFromDB = async () => {
    const currentItem = await response.find(
      (r) => r.queryId === question[0].queryId
    );
    if (currentItem) {
      const payload = {
        ANSWER_SHEET_HEADER_ID: answerSheetHeaderId,
        TEST_QUERY_ID: question[0].queryId,
        TEST_SECTION_ID: section[0].testSection,
        TEST_ANSWER_ID: currentItem?.answerId || null,
        DESCRIPTIVE_ANSWER: currentItem?.descresponse || "",
      };
      try {
        const removeanswer = await axios.post(
          `${API_URL}/removeanswer`,
          payload
        );
      } catch (error) {
        console.log("Error removing response from the database: ", error);
      }
    }
  };

  const handleSectionClick = async (
    e,
    testSection,
    sectionName,
    sectionIndex
  ) => {
    e.preventDefault();
    dispatch(setSection({ testSection, sectionName }));
    dispatch(setQuery(test[0][sectionIndex].queries[0]));
    setCurrentQuestionIndex(0);
    setCurrentSectionIndex(sectionIndex);
    await updateResponseToDB();
  };

  const handleQuestionClick = async (
    e,
    queryId,
    query,
    questionNumber,
    answers
  ) => {
    e.preventDefault();
    dispatch(setQuery({ queryId, query, questionNumber, answers }));
    setCurrentQuestionIndex(questionNumber - 1);
    await updateResponseToDB();
  };

  const handlePreviousClick = async () => {
    if (currentQuestionIndex > 0) {
      dispatch(
        setQuery(test[0][currentSectionIndex].queries[currentQuestionIndex - 1])
      );
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex === 0) {
      const testSection = test[0][currentSectionIndex - 1]._id.testSection;
      const sectionName = test[0][currentSectionIndex - 1]._id.topicName;
      dispatch(setSection({ testSection, sectionName }));
      dispatch(
        setQuery(
          test[0][currentSectionIndex - 1].queries[
            test[0][currentSectionIndex - 1].queries.length - 1
          ]
        )
      );
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(
        test[0][currentSectionIndex - 1].queries.length - 1
      );
    }
    await updateResponseToDB();
  };

  const handleNextClick = async () => {
    const currentSection = test[0][currentSectionIndex];
    if (currentQuestionIndex < currentSection.queries.length - 1) {
      dispatch(
        setQuery(test[0][currentSectionIndex].queries[currentQuestionIndex + 1])
      );
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentQuestionIndex === currentSection.queries.length - 1) {
      const testSection = test[0][currentSectionIndex + 1]._id.testSection;
      const sectionName = test[0][currentSectionIndex + 1]._id.topicName;
      dispatch(setSection({ testSection, sectionName }));
      dispatch(setQuery(test[0][currentSectionIndex + 1].queries[0]));
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
    await updateResponseToDB();
  };

  const handleSummaryClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateResponseToDB();
    dispatch(setSection([]));
    dispatch(setQuery([]));
    navigate("/summary");
  };

  const handleFlagClick = (e) => {
    e.preventDefault();
    const isAnswered = response.find((r) => r.queryId === question[0].queryId);
    if (isAnswered) {
      if (isFlagged) {
        dispatch(unflagQuestion({ queryId: question[0].queryId }));
      } else {
        dispatch(flagQuestion({ queryId: question[0].queryId }));
      }
    } else {
      dispatch(flagQuestion({ queryId: question[0].queryId }));
    }
  };

  const handleClearFields = async () => {
    const currentItem = await response.find(
      (r) => r.queryId === question[0].queryId
    );
    if (currentItem && currentItem.isFlagged) {
      dispatch(removeResponse({ queryId: question[0].queryId }));
      dispatch(flagQuestion({ queryId: question[0].queryId }));
      await removeResponseFromDB();
      setMdxEditorKey((prevKey) => prevKey + 1);
      setCheckboxKey((prevKey) => prevKey + 1);
    } else if (currentItem) {
      dispatch(removeResponse({ queryId: question[0].queryId }));
      await removeResponseFromDB();
      setMdxEditorKey((prevKey) => prevKey + 1);
      setCheckboxKey((prevKey) => prevKey + 1);
    }
  };

  const handleTextareaChange = async (value) => {
    const descResponse = value;
    setCharacterCount(value.length);
    if (value.length === 1000 || value.length > 1000) {
      toast.warning("Character limit reached");
    }
    const isTextareaEmpty = descResponse.trim() === "";
    if (!isTextareaEmpty) {
      dispatch(
        setResponse({
          queryId: question[0].queryId,
          descresponse: value,
          sectionId: section[0].testSection,
        })
      );
    } else {
      dispatch(
        removeResponse({
          queryId: question[0].queryId,
        })
      );
      await removeResponseFromDB();
    }
  };

  const handleRadioButtonChange = (e, answerId) => {
    dispatch(
      setResponse({
        queryId: question[0].queryId,
        response: e.target.value,
        answerId: answerId,
        sectionId: section[0].testSection,
      })
    );
  };

  useEffect(() => {
    fetchTest();
    fetchASHData();
    fetchExistingResponses();
    const handleTabSwitch = async () => {
      if (document.visibilityState === "hidden") {
        tabSwitchCount = tabSwitchCount + 1;
        const switchResponse = await axios.post(`${API_URL}/tabswitch`, {
          ANSWER_SHEET_HEADER_ID: answerSheetHeaderId,
          CANDIDATE_ID: candidateId,
          TEST_ID: testId,
          TAB_SWITCH_COUNT: tabSwitchCount,
        });
      }
    };
    document.addEventListener("visibilitychange", handleTabSwitch);
    return () => {
      document.removeEventListener("visibilitychange", handleTabSwitch);
    };
  }, []);

  return (
    <div className="outlet-container">
      <div className="header-bar">
        <div className="section-bar">
          {test && test.length
            ? test.map((id) =>
                id.map((sections, index) => (
                  <SectionComponent
                    key={index}
                    sectionName={sectionNames[index]}
                    sectionId={sections._id.testSection}
                    topicName={sections._id.topicName?.toUpperCase()}
                    isActive={
                      sections._id.testSection === section[0].testSection
                    }
                    onClick={(e) =>
                      handleSectionClick(
                        e,
                        sections._id.testSection,
                        sections._id.topicName,
                        index
                      )
                    }
                  />
                ))
              )
            : null}
        </div>
        <div className="countdown-timer">
          <CountdownTimer />
        </div>
      </div>
      <div className="outlet-container">
        <div className="question-bar">
          <div className="question-bar-elements">
            {test && test.length
              ? test.map((id) =>
                  id.map((activesection) =>
                    activesection._id.testSection === section[0].testSection
                      ? activesection.queries.map((query, index) => (
                          <QuestionComponent
                            key={index}
                            questionNumber={query.questionNumber}
                            queryId={query.queryId}
                            query={query.query}
                            isActive={query.queryId === question[0].queryId}
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
                                ?.isFlagged === true
                            }
                            onClick={(e) =>
                              handleQuestionClick(
                                e,
                                query.queryId,
                                query.query,
                                query.questionNumber,
                                query.answers
                              )
                            }
                          />
                        ))
                      : null
                  )
                )
              : null}
          </div>
          <div className="response-buttons">
            <div className="clear-response-button">
              <ButtonComponent
                class={`clear-response`}
                name={`Clear Response`}
                onClick={handleClearFields}
                component={<VscTrash />}
              />
            </div>
            <div className="flag-button">
              <ButtonComponent
                class={`flag ${isFlagged === true ? "flagged" : ""}`}
                name={`${isFlagged === true ? "Unmark Flag" : "Mark Flag"}`}
                onClick={handleFlagClick}
                component={<PiFlagLight />}
              />
            </div>
          </div>
        </div>
        <div>
          {test && test.length
            ? test.map((id) =>
                id.map((activesection) =>
                  activesection._id.testSection === section[0].testSection
                    ? activesection.queries.map(
                        (query, index) =>
                          query.queryId === question[0].queryId && (
                            <div>
                              <div className="question-div" key={index}>
                                <div className="question-header">
                                  <div>Question :</div>
                                  <div>({query.marks} marks)</div>
                                </div>
                                <div className="negative-marks-prompt">
                                  {query.minusMarks > 0
                                    ? "(This question contains negative marks)"
                                    : null}
                                </div>
                                <RichTextEditor
                                  query={query.query}
                                  questionNumber={query.questionNumber}
                                />
                              </div>
                              <div className="answer-div">
                                {query.answers.length > 1 ? (
                                  <b style={{ fontWeight: "500" }}>Answer : </b>
                                ) : null}
                                {query.answers && query.answers.length === 1 ? (
                                  <div>
                                    <div className="character-count">
                                      <b style={{ fontWeight: "500" }}>
                                        Answer :{" "}
                                      </b>
                                      (Maximum 1000 characters)
                                    </div>
                                    <div className="mdx-editor">
                                      <MDXEditor
                                        key={mdxEditorKey}
                                        name="descriptive answer"
                                        markdown={
                                          response.find(
                                            (r) =>
                                              r.queryId === question[0].queryId
                                          )?.descresponse || ""
                                        }
                                        readOnly={false}
                                        placeholder="Type your answer here"
                                        onChange={(value) =>
                                          handleTextareaChange(value)
                                        }
                                        contentEditableClassName="prose"
                                        plugins={[
                                          maxLengthPlugin(1000),
                                          tablePlugin(),
                                          thematicBreakPlugin(),
                                          listsPlugin(),
                                          headingsPlugin(),
                                          markdownShortcutPlugin(),
                                          codeBlockPlugin({
                                            defaultCodeBlockLanguage: "txt",
                                          }),
                                          codeMirrorPlugin({
                                            codeBlockLanguages: {
                                              txt: "text",
                                              html: "HTML",
                                              css: "CSS",
                                              cpp: "C,C++",
                                              java: "Java",
                                              tsx: "JavaScript",
                                              python: "Python",
                                              bash: "Bash",
                                              sql: "Sql",
                                            },
                                          }),
                                        ]}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  query.answers
                                    .map((answer, answerIndex) => (
                                      <div
                                        className="radio-div"
                                        key={answerIndex}
                                      >
                                        <input
                                          className="option-input checkbox"
                                          type="radio"
                                          value={answer.answer}
                                          name="answer"
                                          checked={
                                            response.find(
                                              (r) =>
                                                r.queryId ===
                                                question[0].queryId
                                            )?.answerId === answer.answerId
                                          }
                                          displayLast={
                                            answer.displaylast === "Y"
                                          }
                                          onChange={(e) =>
                                            handleRadioButtonChange(
                                              e,
                                              answer.answerId
                                            )
                                          }
                                        />
                                        {String.fromCharCode(
                                          64 + answer.answerSeqNum
                                        )}
                                        {")"} {answer.answer}
                                      </div>
                                    ))
                                    .sort((a, b) => {
                                      const aDisplayLast =
                                        a.props.children[0].props.displayLast ||
                                        false;
                                      const bDisplayLast =
                                        b.props.children[0].props.displayLast ||
                                        false;
                                      return aDisplayLast
                                        ? 1
                                        : bDisplayLast
                                        ? -1
                                        : 0;
                                    })
                                )}
                              </div>
                            </div>
                          )
                      )
                    : null
                )
              )
            : null}
        </div>
        <div className="navigation-buttons">
          <ButtonComponent
            class="previous-btn"
            name={`${buttons.previousButton}`}
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            onClick={handlePreviousClick}
          />
          {test &&
          test[0] &&
          currentSectionIndex === test[0].length - 1 &&
          test[0][currentSectionIndex]?.queries &&
          currentQuestionIndex ===
            test[0][currentSectionIndex].queries.length - 1 ? (
            <ButtonComponent
              class="summary-btn"
              name={`${buttons.summaryButton}`}
              onClick={handleSummaryClick}
            />
          ) : (
            <ButtonComponent
              class="next-btn"
              name={`${buttons.nextButton}`}
              onClick={handleNextClick}
            />
          )}
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};
