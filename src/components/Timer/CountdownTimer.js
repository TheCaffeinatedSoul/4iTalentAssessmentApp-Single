import React, { useEffect, useState } from "react";
import "./style.css";
import { API_URL } from "../../api/api";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setTest } from "../../redux/features/test/testSlice";
import { setSection } from "../../redux/features/section/sectionSlice";
import { clearResponses } from "../../redux/features/response/responseSlice";
import { setQuery } from "../../redux/features/query/querySlice";
import { toast } from "react-toastify";
import { timerMsgs } from "../../messages/constants";

export const CountdownTimer = () => {
  const [cookie, setCookie, removeCookie] = useCookies();

  const [seconds, setSeconds] = useState(59);
  const [minutes, setMinutes] = useState(59);

  const answerSheetHeaderId = cookie.ANSWER_SHEET_HEADER_ID;
  const testId = cookie.TEST_ID;

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTestDuration = async () => {
      try {
        const test = await axios.post(`${API_URL}/testinfo`, {
          TEST_ID: testId,
        });
        const testDuration = test.data.data.TEST_DURATION;
        setMinutes(testDuration);
        const response = await axios.post(`${API_URL}/testduration`, {
          ANSWER_SHEET_HEADER_ID: answerSheetHeaderId,
        });
        if (response.data.data) {
          const totalSeconds = response.data.data / 1000;
          const durationMin = Math.floor(totalSeconds / 60);
          const durationSec = Math.floor(totalSeconds % 60);
          if (durationMin <= testDuration) {
            if (durationMin === 0) {
              setMinutes(testDuration - 1);
            } else {
              setMinutes(60 - durationMin);
            }
          } else {
            const finishData = await axios.post(`${API_URL}/testcompleted`, {
              TEST_ID: cookie.TEST_ID,
              CANDIDATE_ID: cookie.CANDIDATE_ID,
            });
            toast.error(timerMsgs.TIME_LIMIT_REACHED);
            dispatch(setTest([]));
            dispatch(setSection([]));
            dispatch(clearResponses([]));
            dispatch(setQuery([]));

            removeCookie("TEST_ID");
            removeCookie("TEST_KEY_NUM");
            removeCookie("ANSWER_SHEET_HEADER_ID");
            removeCookie("CANDIDATE_ID");
            removeCookie("NAME");
          }

          setSeconds(59 - durationSec);
        }
      } catch (error) {
        console.log("Error fetching test duration: ", error);
      }
    };

    fetchTestDuration();
  }, [answerSheetHeaderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);

          toast.warning(timerMsgs.TEST_AUTO_SUBMIT);

          setTimeout(async () => {
            const finishData = await axios.post(`${API_URL}/testcompleted`, {
              TEST_ID: cookie.TEST_ID,
              CANDIDATE_ID: cookie.CANDIDATE_ID,
            });
            dispatch(setTest([]));
            dispatch(setSection([]));
            dispatch(clearResponses([]));
            dispatch(setQuery([]));

            removeCookie("TEST_ID");
            removeCookie("TEST_KEY_NUM");
            removeCookie("ANSWER_SHEET_HEADER_ID");
            removeCookie("CANDIDATE_ID");
            removeCookie("NAME");
          }, 8000);
          return;
        }
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        setSeconds(seconds - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes, seconds]);

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="timer-component">
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
        >
          <path
            d="M21 3.9375C11.5763 3.9375 3.9375 11.5763 3.9375 21C3.9375 30.4237 11.5763 38.0625 21 38.0625C30.4237 38.0625 38.0625 30.4237 38.0625 21C38.0625 11.5763 30.4237 3.9375 21 3.9375ZM14.2464 13.317L22.8596 19.1412C23.4282 19.5507 23.8127 20.1675 23.93 20.8583C24.0472 21.5491 23.8878 22.2583 23.4863 22.8325C23.0847 23.4067 22.4732 23.7997 21.7841 23.9265C21.095 24.0533 20.3837 23.9037 19.804 23.5102C19.5493 23.3306 19.3273 23.1086 19.1477 22.8539L13.3235 14.2406C13.2339 14.1122 13.1923 13.9563 13.206 13.8003C13.2198 13.6443 13.288 13.4981 13.3988 13.3873C13.5095 13.2766 13.6557 13.2083 13.8118 13.1946C13.9678 13.1808 14.1237 13.2224 14.2521 13.312L14.2464 13.317ZM21 35.4375C13.043 35.4375 6.5625 28.9611 6.5625 21C6.55574 19.0582 6.944 17.1354 7.70368 15.3483C8.46336 13.5613 9.57858 11.9475 10.9815 10.605C11.0906 10.4962 11.2203 10.4103 11.363 10.3521C11.5056 10.294 11.6585 10.2648 11.8125 10.2663C11.9666 10.2679 12.1188 10.3 12.2603 10.361C12.4018 10.422 12.5297 10.5105 12.6366 10.6214C12.7436 10.7323 12.8274 10.8634 12.8831 11.007C12.9389 11.1506 12.9655 11.3039 12.9614 11.4579C12.9573 11.6119 12.9225 11.7636 12.8592 11.904C12.7959 12.0445 12.7053 12.1709 12.5926 12.276C11.4154 13.4028 10.4795 14.7572 9.84196 16.257C9.20442 17.7567 8.87849 19.3704 8.88398 21C8.88398 27.6806 14.3194 33.116 21 33.116C27.6806 33.116 33.116 27.6806 33.116 21C33.116 14.7107 28.2991 9.52547 22.1607 8.94141V13.4531C22.1607 13.761 22.0385 14.0562 21.8208 14.2739C21.6031 14.4916 21.3078 14.6139 21 14.6139C20.6922 14.6139 20.3969 14.4916 20.1792 14.2739C19.9615 14.0562 19.8393 13.761 19.8393 13.4531V7.72324C19.8393 7.41539 19.9615 7.12015 20.1792 6.90247C20.3969 6.68479 20.6922 6.5625 21 6.5625C28.9611 6.5625 35.4375 13.043 35.4375 21C35.4375 28.957 28.9611 35.4375 21 35.4375Z"
            fill="black"
          />
        </svg>
      </span>
      <span>
        {formatTime(minutes)}:{formatTime(seconds)} mins
      </span>
    </div>
  );
};
