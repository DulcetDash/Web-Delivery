import React from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { BrowserRouter as Router, Link, Redirect } from "react-router-dom"; // Ke
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateCurrentLocationMetadat } from "../../Redux/HomeActionsCreators";
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
import {
  ImUserPlus,
  ImMap,
  ImBlocked,
  ImUserCheck,
  ImUsers,
  ImPower,
  ImEarth,
  ImPieChart,
  ImShare2,
} from "react-icons/im";
import { MdApps } from "react-icons/md";

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
  }

  componentDidMount() {
    let globalObject = this;
  }

  render() {
    return (
      <ProSidebar>
        <Menu iconShape="square">
          <div className="logoContainer" style={{ color: "#4b5158" }}>
            Dashboard
          </div>
          <MenuItem className="menuItemSideBar">
            <Link to="/Delivery">
              <AiTwotoneBuild style={iconStyle} />
              <span className="menuText">Make a delivery</span>
            </Link>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <Link to="/MyDeliveries">
              <MdApps style={iconStyle} />
              <span className="menuText">My deliveries</span>
            </Link>
          </MenuItem>

          <MenuItem className="menuItemSideBar">
            <Link to="/Statistics">
              <AiOutlineLineChart style={iconStyle} />
              <span className="menuText">Statistics</span>
            </Link>
          </MenuItem>
          {/* <MenuItem className="menuItemSideBar">
            <Link to="/Settings">
              <AiOutlineSetting style={iconStyle} />
              <span className="menuText">Settings</span>
            </Link>
          </MenuItem> */}

          <MenuItem className="menuItemSideBar">
            <Link
              onClick={() => {
                this.props.LogOut();
                window.location.href = "/";
              }}
            >
              <AiOutlineLogout style={iconStyle} />
              <span className="menuText">Log out</span>
            </Link>
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
              <span className="menuTextVersionNo">v1.0.003</span>
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
