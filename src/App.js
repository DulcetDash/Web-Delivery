import logo from "./logo.svg";
import "./App.css";
import { Provider } from "react-redux";
import HomeReducer from "./Redux/Reducers/HomeReducer";
import { createStore } from "redux";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { PersistGate } from "redux-persist/integration/react";
import { parse, stringify } from "flatted";

import Entry from "./Entry";
import { Toaster } from "react-hot-toast";

export const transformCircular = createTransform(
  (inboundState, key) => stringify(inboundState),
  (outboundState, key) => parse(outboundState)
);

const persistConfig = {
  key: "root-app",
  storage,
  stateReconciler: autoMergeLevel2,
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
        <Toaster containerStyle={{ zIndex: 90000000000 }} />
        <Entry />
      </PersistGate>
    </Provider>
  );
}

export default App;
