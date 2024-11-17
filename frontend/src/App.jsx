import { Route, Routes } from "react-router-dom";
import Usersign from "./components/usersign.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Admin from "./components/admin.jsx";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/usersign" element={<Usersign />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
