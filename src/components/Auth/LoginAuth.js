import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";

const LoginAuth = ({ children }) => {
  const [cookie] = useCookies();

  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    if (cookie.CANDIDATE_ID && cookie.ANSWER_SHEET_HEADER_ID) {
      setCurrentUser({
        CANDIDATE_ID: cookie.CANDIDATE_ID,
        ANSWER_SHEET_HEADER_ID: cookie.ANSWER_SHEET_HEADER_ID,
      });
    } else if (cookie.CANDIDATE_ID) {
      setCurrentUser({
        CANDIDATE_ID: cookie.CANDIDATE_ID,
      });
    } else {
      setCurrentUser(null);
    }
  }, [cookie]);

  if (currentUser === undefined) {
    return null;
  }

  if (currentUser && currentUser.ANSWER_SHEET_HEADER_ID) {
    return <Navigate to="/test" />;
  }

  return children;
};

LoginAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoginAuth;
