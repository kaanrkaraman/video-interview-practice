import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Welcome } from "./pages/Welcome";
import { InterviewSession } from "./pages/InterviewSession";
import { History } from "./pages/History";
import { Dashboard } from "./pages/Dashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/history" element={<History />} />
                <Route path="/session/:sessionId" element={<InterviewSession />} />
                <Route path="/session/:sessionId/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
