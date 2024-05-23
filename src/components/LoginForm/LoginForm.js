import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../api/api";
import useLookupType from "../../hooks/useLookupType";
import { errorMessages, events, headers } from "../../messages/constants";
import { Loader } from "../PageLoader/PageLoader";
import logo from "../../assets/Resources/4i_Blue Logo with GPTW-01-01.svg";

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    EMAIL_ID: "",
    TEST_ID: "",
    TEST_KEY: "",
  });
  const [errorField, setErrorField] = useState([]);
  const [loading, setLoading] = useState(false);

  const [URLSearchParams] = useSearchParams();
  const [testStatusLookupValues] = useLookupType({
    LOOKUP_TYPE: "test status",
  });
  const searchParams = Object.fromEntries(URLSearchParams);

  const { CANDIDATE_ID, TEST_ID, TEST_KEY_NUM, NAME, TEST_STATUS } =
    useMemo(() => {
      return {
        CANDIDATE_ID: searchParams.CANDIDATE_ID || "",
        TEST_ID: searchParams.TEST_ID || "",
        TEST_KEY_NUM: searchParams.TEST_KEY_NUM || "",
        TEST_STATUS: searchParams.TEST_STATUS || "",
        NAME: searchParams.NAME || "",
      };
    }, [searchParams]);

  const [cookie, setCookie] = useCookies([
    "CANDIDATE_ID",
    "TEST_ID",
    "TEST_KEY_NUM",
    "ANSWER_SHEET_HEADER_ID",
    "NAME",
  ]);
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setFormData({ ...formData, [input.name]: input.value });
  };

  const validateFields = (e) => {
    e.preventDefault();
    const error = [];
    let regex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]{2,3}$/i;
    if (formData.EMAIL_ID === "") {
      error.push("EMAIL_ID");
    }
    if (formData.EMAIL_ID) {
      if (!regex.test(formData.EMAIL_ID)) {
        error.push("INVALID_EMAIL_FORMAT");
      }
    }
    if (formData.TEST_ID === "") {
      error.push("TEST_ID");
    }
    if (formData.TEST_KEY === "") {
      error.push("TEST_KEY");
    }
    if (error.length === 0) {
      verifyKey(e);
    } else {
      setErrorField(error);
    }
  };

  const requestFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    }
  };

  const verifyKey = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/candidatelogin`, formData);
      if (response && response.data.data.code === "TEST_DONE") {
        toast.warning(`${events.TEST_DONE}`);
      } else if (response) {
        setCookie("CANDIDATE_ID", response.data.data[0].CANDIDATE_ID, {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        setCookie("TEST_ID", response.data.data[0].TEST_ID, {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        setCookie("TEST_KEY_NUM", response.data.data[0].TEST_KEY_NUM, {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        setCookie("NAME", response.data.data[0].candidateinfo.FIRST_NAME, {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        if (response.data.data[0].testInfo[0].RETEST_COUNT !== 0) {
          if (
            response.data.data[0].TEST_STATUS ===
            testStatusLookupValues.find((obj) => {
              return obj.LOOKUP_CODE === "IN_PROGRESS";
            }).LOOKUP_ID
          ) {
            setCookie(
              "ANSWER_SHEET_HEADER_ID",
              response.data.data[0].answersheetheaderinfo
                ? response.data.data[0].answersheetheaderinfo[0]
                    .ANSWER_SHEET_HEADER_ID
                : null,
              {
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
              }
            );
          }
        }
        toast.success(`${events.LOGIN_SUCCESS}`);
        requestFullScreen();
        navigate("/instructions");
      } else {
        toast.error(`${events.LOGIN_FAIL}`);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error(`${events.CONN_FAIL}`);
      } else {
        toast.error(`${events.INVALID_CREDS}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const internalLogin = async () => {
    const internalFormData = {
      FIRST_NAME: searchParams.NAME,
      CANDIDATE_ID: searchParams.CANDIDATE_ID,
      TEST_ID: searchParams.TEST_ID,
      TEST_KEY_NUM:
        searchParams.TEST_KEY_NUM === "null" ? null : searchParams.TEST_KEY_NUM,
      TEST_STATUS: searchParams.TEST_STATUS,
    };
    setCookie("CANDIDATE_ID", CANDIDATE_ID, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    setCookie("TEST_ID", TEST_ID, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    setCookie("TEST_KEY_NUM", TEST_KEY_NUM, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    setCookie("NAME", NAME, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    if (testStatusLookupValues.length > 0) {
      if (
        searchParams.TEST_STATUS ===
        testStatusLookupValues.find((obj) => {
          return obj.LOOKUP_CODE === "IN_PROGRESS";
        }).LOOKUP_ID
      ) {
        const response = await axios.post(
          `${API_URL}/internallogin`,
          internalFormData
        );
        setCookie(
          "ANSWER_SHEET_HEADER_ID",
          response.data.data[0].answersheetheaderinfo
            ? response.data.data[0].answersheetheaderinfo[0]
                .ANSWER_SHEET_HEADER_ID
            : null,
          {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
          }
        );
        navigate("/test");
        // requestFullScreen();
      } else {
        navigate("/instructions");
        // requestFullScreen();
      }
    }
  };

  useEffect(() => {
    setErrorField([]);
  }, [formData]);

  if (
    searchParams.NAME &&
    searchParams.CANDIDATE_ID &&
    searchParams.TEST_ID &&
    searchParams.TEST_KEY_NUM &&
    searchParams.TEST_STATUS
  ) {
    internalLogin();
  }

  return (
    <div className="card login-form-card col-md-4 col-sm-8">
      <div className="card-header">
        <img alt="4i Logo" src={logo} height="55vh" />
        <label className="login-header">{headers.mainHeader}</label>
      </div>
      <div className="card-body">
        {loading && <Loader />}
        <form>
          <div className="mb-1">
            <label className="login-form-label required">E-Mail ID</label>
            <input
              className={`form-control ${
                errorField.includes("EMAIL_ID") ||
                errorField.includes("INVALID_EMAIL_FORMAT")
                  ? "is-invalid"
                  : ""
              }`}
              type="email"
              name="EMAIL_ID"
              required
              value={formData.EMAIL_ID}
              onChange={handleChange}
            ></input>
            {errorField.includes("EMAIL_ID") && (
              <div className="invalid-feedback">
                {errorMessages.EMPTY_EMAIL}
              </div>
            )}
            {errorField.includes("INVALID_EMAIL_FORMAT") && (
              <div className="invalid-feedback">
                {errorMessages.INVALID_EMAIL}
              </div>
            )}
          </div>
          <div className="mb-1">
            <label className="login-form-label required">Test ID</label>
            <input
              className={`form-control ${
                errorField.includes("TEST_ID") ? "is-invalid" : ""
              }`}
              type="text"
              name="TEST_ID"
              required
              value={formData.TEST_ID}
              onChange={handleChange}
            ></input>
            {errorField.includes("TEST_ID") && (
              <div className="invalid-feedback">
                {errorMessages.EMPTY_TEST_ID}
              </div>
            )}
          </div>
          <div className="mb-1">
            <label className="login-form-label required">Test Key</label>
            <input
              className={`form-control ${
                errorField.includes("TEST_KEY") ? "is-invalid" : ""
              }`}
              type="password"
              name="TEST_KEY"
              required
              value={formData.TEST_KEY}
              onChange={handleChange}
            ></input>
            {errorField.includes("TEST_KEY") && (
              <div className="invalid-feedback">
                {errorMessages.EMPTY_TEST_KEY}
              </div>
            )}
          </div>
          <div className="verify-key-div">
            <button
              className={`btn btn-primary verify-btn`}
              onClick={(e) => validateFields(e)}
              disabled={loading}
            >
              {loading ? "Validating..." : "Validate key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
