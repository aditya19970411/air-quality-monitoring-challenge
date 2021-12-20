import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import City from "./components/City";
import EnhancedTable from "./components/EnhancedTable";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<EnhancedTable />}></Route>
        <Route path="/city/:slug" element={<City />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
