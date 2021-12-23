import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import City from "./components/City";
import EnhancedTable from "./components/Main";
import Compare from "./components/Compare";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<EnhancedTable />} />
        <Route path="/city/:slug" element={<City />} />
        <Route path={"/compare/:slug"} element={<Compare />} />
      </Routes>
    </Router>
  );
};

export default App;
