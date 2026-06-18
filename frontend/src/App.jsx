import { Route, Routes, useSearchParams } from "react-router-dom";
import UserBar from "./components/UserBar";
import HomePage from "./pages/HomePage";
import HomeworkDetailPage from "./pages/HomeworkDetailPage";
import { parseUserId } from "./utils/routes";
import "./App.css";

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = parseUserId(searchParams.get("user"));

  function handleUserChange(nextUserId) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("user", String(nextUserId));
        return next;
      },
      { replace: true }
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Homework Manager</h1>
        <UserBar userId={userId} onUserChange={handleUserChange} />
      </header>

      <Routes>
        <Route path="/" element={<HomePage userId={userId} />} />
        <Route
          path="/homework/:id"
          element={<HomeworkDetailPage userId={userId} />}
        />
      </Routes>
    </div>
  );
}
