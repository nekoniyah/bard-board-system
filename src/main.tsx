import { Provider } from "./components/ui/provider";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.body).render(
    <Provider>
        <App />
    </Provider>
);
