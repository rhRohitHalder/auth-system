import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Registration from "./pages/Registration.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/register" element={<Registration />} />
    </Routes>
  );
};

export default App;
