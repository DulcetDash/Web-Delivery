import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./Components/Home";
import { Provider } from "react-redux";
import HomeReducer from "./Redux/Reducers/HomeReducer";
import { createStore } from "redux";

const store = createStore(HomeReducer);

function App() {
  return (
    <Provider store={store}>
      <Switch>
        <Route path="/" exact component={Home} />
      </Switch>
    </Provider>
  );
}

export default App;
