import React from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { BrowserRouter as Router, Link, Redirect } from "react-router-dom"; // Ke
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  LogOut,
  UpdateLoggingData,
  UpdateTripsData,
} from "../../Redux/HomeActionsCreators";
import SOCKET_CORE from "../../Helper/managerNode";
import "react-pro-sidebar/dist/css/styles.css";
import "./sidebar.scss";
import {
  AiFillAppstore,
  AiFillSignal,
  AiFillInfoCircle,
  AiOutlineLogout,
  AiOutlineSetting,
  AiOutlineLineChart,
  AiTwotoneBuild,
} from "react-icons/ai";
import { MdApps, MdExtension } from "react-icons/md";
import axios from "axios";
import { PRIMARY } from "../../Helper/Colors";

const iconStyle = {
  width: 35,
  height: 20,
  position: "relative",
  top: "4px",
  color: "#01101f",
};

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.intervalPersister = null;

    this.shouldBeRenderedBasedOnAccess();
  }

  componentDidMount() {
    let globalObject = this;

    this.shouldBeRenderedBasedOnAccess();
    this.updateBackgroundData();

    /**
     * Handle the updating of the account data
     */
    this.SOCKET_CORE.on(
      "getAccountDataDeliveryWeb_io-response",
      function (response) {
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null &&
          /authed/i.test(response.response)
        ) {
          globalObject.props.UpdateLoggingData(response.metadata);
        }
      }
    );
  }

  updateBackgroundData() {
    let globalObject = this;

    this.intervalPersister = setInterval(async () => {
      try {
        //! Get the account data
        let bundle = {
          latitude: globalObject.props.App.latitude,
          longitude: globalObject.props.App.longitude,
          user_identifier:
            globalObject.props.App.userData?.loginData?.company_fp,
          user_nature: "rider",
          pushnotif_token: false,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_URL}/getShoppingData`,
          bundle,
          {
            headers: {
              Authorization: `Bearer ${globalObject.props.App.userData?.loginData?.company_fp}`,
            },
          }
        );

        if (response?.data?.accountData) {
          this.props.UpdateLoggingData(response?.data?.accountData);
        }

        if (response?.data?.requests) {
          this.props.UpdateTripsData(response?.data?.requests);
        }

        globalObject.shouldBeRenderedBasedOnAccess();
      } catch (error) {
        console.log(error);
      }
    }, 7000);
  }

  componentDidUpdate() {
    this.shouldBeRenderedBasedOnAccess();
  }

  /**
   * Responsible to answer to yes or no question of which component should be rendered
   * @return true: Yes render
   * @return false: No do not render
   */
  shouldBeRenderedBasedOnAccess() {
    if (
      (this.props.App.userData.loginData === null ||
        this.props.App.userData.loginData.company_fp === undefined ||
        this.props.App.userData.loginData.company_fp === null ||
        this.props.App.userData.loginData.company_fp === undefined ||
        this.props.App.userData.loginData.company_name === true ||
        this.props.App.userData.loginData.company_name === undefined ||
        this.props.App.userData.loginData.company_name === null) &&
      /\/$/.test(window.location.href) === false
    ) {
      this.props.LogOut();
      setTimeout(function () {
        window.location.href = "/";
      }, 800);
    }
  }

  getRightColorForSelectedMenu(menuName) {
    const route = window.location.href
      .split("/")
      [window.location.href.split("/").length - 1].toLowerCase()
      .trim();

    if (route === menuName.toLowerCase().trim()) {
      return PRIMARY;
    } else {
      return "#4b5158";
    }
  }

  handleClick = () => {
    window.location.reload();
  };

  render() {
    this.shouldBeRenderedBasedOnAccess();
    ///...
    return (
      <ProSidebar>
        <Menu iconShape="square">
          <div className="logoContainer" style={{ color: "#4b5158" }}>
            Dashboard
          </div>
          <MenuItem className="menuItemSideBar">
            <a href="/Delivery">
              <AiTwotoneBuild
                style={{
                  ...iconStyle,
                  color: this.getRightColorForSelectedMenu("delivery"),
                }}
              />
              <span
                className="menuText"
                style={{
                  color: this.getRightColorForSelectedMenu("delivery"),
                }}>
                Make a delivery
              </span>
            </a>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <a href="/MyDeliveries">
              <MdApps
                style={{
                  ...iconStyle,
                  color: this.getRightColorForSelectedMenu("mydeliveries"),
                }}
              />
              <span
                className="menuText"
                style={{
                  color: this.getRightColorForSelectedMenu("mydeliveries"),
                }}>
                My deliveries
              </span>
            </a>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <a href="/plans">
              <MdExtension
                style={{
                  ...iconStyle,
                  color: this.getRightColorForSelectedMenu("plans"),
                }}
              />
              <span
                className="menuText"
                style={{
                  color: this.getRightColorForSelectedMenu("plans"),
                }}>
                Subscriptions
              </span>
            </a>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <a href="/Settings">
              <AiOutlineSetting
                style={{
                  ...iconStyle,
                  color: this.getRightColorForSelectedMenu("settings"),
                }}
              />
              <span
                className="menuText"
                style={{
                  color: this.getRightColorForSelectedMenu("settings"),
                }}>
                Settings
              </span>
            </a>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <a
              onClick={() => {
                this.props.LogOut();
                setTimeout(function () {
                  window.location.href = "/";
                }, 1000);
              }}>
              <AiOutlineLogout style={iconStyle} />
              <span className="menuText">Log out</span>
            </a>
          </MenuItem>

          <MenuItem className="menuTextVersionNo">
            <Link>
              <AiFillInfoCircle
                style={{
                  width: 30,
                  height: 15,
                  position: "relative",
                  top: "2px",
                  color: /Development/i.test(
                    String(process.env.REACT_APP_ENVIRONMENT)
                  )
                    ? "red"
                    : "#01101f",
                }}
              />
              <span className="menuTextVersionNo">v1.0.043</span>
            </Link>
          </MenuItem>
        </Menu>
      </ProSidebar>
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
      UpdateCurrentLocationMetadat,
      LogOut,
      UpdateLoggingData,
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
