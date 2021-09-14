import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import HomeReducer from "./Redux/Reducers/HomeReducer";
import { createStore } from "redux";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { PersistGate } from "redux-persist/integration/react";
import { parse, stringify } from "flatted";

import Home from "./Components/Home";
import PresentPlans from "./Components/Screens/PresentPlans";
import Delivery from "./Components/Screens/Delivery";
import Sidebar from "./Components/Sidebar/Sidebar";
import HeaderStd from "./Components/HeaderStd/HeaderStd";

export const transformCircular = createTransform(
  (inboundState, key) => stringify(inboundState),
  (outboundState, key) => parse(outboundState)
);

const persistConfig = {
  key: "root",
  storage,
  stateReconciler: hardSet,
  transforms: [transformCircular],
};

// const store = createStore(HomeReducer);
const persistedReducer = persistReducer(persistConfig, HomeReducer);
let store = createStore(persistedReducer);
let persistor = persistStore(store);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div
          style={{
            backgroundColor: "#f3f3f3",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "100vh",
          }}
        >
          <HeaderStd />
          <div className="mainParentNode">
            <div className="sidebar">
              <Sidebar />
            </div>
            <div className="globalDisplayContent">
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/plans" component={PresentPlans} />
                <Route path="/Delivery" component={Delivery} />
              </Switch>
            </div>
          </div>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
