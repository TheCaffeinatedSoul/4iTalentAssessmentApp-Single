import { Route, Routes, Navigate } from "react-router-dom";
import { Instructions } from "./pages/Instructions/Instructions";
import { SummaryScreen } from "./pages/SummaryScreen/Index";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { TestScreen } from "./pages/TestScreen/Index";
import { Layout } from "./Layout/Layout";
import Auth from "./components/Auth/Auth";
import "react-toastify/dist/ReactToastify.css";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import LoginAuth from "./components/Auth/LoginAuth";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginAuth>
            <LoginPage />
          </LoginAuth>
        }
      />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route
          path="/instructions"
          element={
            <Auth>
              <Instructions />
            </Auth>
          }
        />
        <Route
          path="/test"
          element={
            <Auth>
              <TestScreen />
            </Auth>
          }
        />
        <Route
          path="/summary"
          element={
            <Auth>
              <SummaryScreen />
            </Auth>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
