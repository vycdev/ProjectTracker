import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
// @ts-ignore ReactDOM.unstable_createRoot(root).render(<App />);
const root = ReactDOM.createRoot(container);
root.render(<App />);
