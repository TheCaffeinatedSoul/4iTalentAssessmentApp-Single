import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";

const Auth = ({ children }) => {
  const [cookie] = useCookies();

  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    if (cookie.CANDIDATE_ID) {
      setCurrentUser({ CANDIDATE_ID: cookie.CANDIDATE_ID });
    } else {
      setCurrentUser(null);
    }
  }, [cookie]);

  if (currentUser === undefined) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

Auth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Auth;
