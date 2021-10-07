import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
} from "./Redux/HomeActionsCreators";
import Home from "./Components/Home";
import PresentPlans from "./Components/Screens/PresentPlans";
import Delivery from "./Components/Screens/Delivery";
import Sidebar from "./Components/Sidebar/Sidebar";
import HeaderStd from "./Components/HeaderStd/HeaderStd";
import MyDeliveries from "./Components/Screens/MyDeliveries";
import Purchase from "./Components/Screens/Purchase";
import History from "./Components/Screens/History";
import Statistics from "./Components/Screens/Statistics";
import Settings from "./Components/Screens/Settings";

class Entry extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  /**
   * Responsible to answer to yes or no question of which component should be rendered
   * @return true: Yes render
   * @return false: No do not render
   */
  shouldBeRenderedBasedOnAccess() {
    let initialCond =
      this.props.App.userData.loginData !== null &&
      this.props.App.userData.loginData.company_fp !== undefined &&
      this.props.App.userData.loginData.company_fp !== null &&
      this.props.App.userData.loginData.company_fp !== undefined &&
      this.props.App.userData.loginData.company_name !== undefined &&
      this.props.App.userData.loginData.company_name !== null;

    //...
    return (
      initialCond &&
      /(plans|purchase)/i.test(window.location.href) === false &&
      /\/$/i.test(window.location.href) === false
    );
  }

  render() {
    return (
      <div
        style={{
          backgroundColor: "#f3f3f3",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {this.shouldBeRenderedBasedOnAccess() ? <HeaderStd /> : <></>}
        <div className="mainParentNode">
          {this.shouldBeRenderedBasedOnAccess() ? (
            <div className="sidebar">
              <Sidebar />
            </div>
          ) : (
            <></>
          )}
          <div className="globalDisplayContent">
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/plans" component={PresentPlans} />
              <Route path="/Delivery" component={Delivery} />
              <Route path="/MyDeliveries" component={MyDeliveries} />
              <Route path="/Purchase" component={Purchase} />
              <Route path="/History" component={History} />
              <Route path="/Statistics" component={Statistics} />
              <Route path="/Settings" component={Settings} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { App } = state;
  return { App };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Entry);
