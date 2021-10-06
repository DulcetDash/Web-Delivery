import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
} from "../../Redux/HomeActionsCreators";
import {
  MdAccessTime,
  MdDeleteSweep,
  MdNearMe,
  MdPhone,
  MdBrightness1,
  MdCheckCircle,
  MdBlock,
  MdAutorenew,
  MdArrowForward,
  MdPlayArrow,
  MdStar,
  MdWork,
} from "react-icons/md";
import classes from "../../styles/Settings.module.css";
import SOCKET_CORE from "../../Helper/managerNode";
import { FiArrowRight } from "react-icons/fi";
import Loader from "react-loader-spinner";
import jigsaw from "../../Images/jigsaw.png";
import bird from "../../Images/bird.png";
import divide from "../../Images/divide.png";
import layer from "../../Images/layer.png";

class Settings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    this.planCodes = {
      STR: "Starter",
      ITMD: "Intermediate",
      PR: "Pro",
      PRSNLD: "Personalised",
    };

    this.state = {
      isLoading: true, //If something is loading or not
    };
  }

  componentDidMount() {
    let globalObject = this;

    //Handle socket io events
    console.log(this.props.App.userData.loginData);
  }

  componentWillMount() {}

  renderAppropriateSidePlans(planSelected = "starter") {
    if (/starter/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planICON}>
            <img alt="planIco" src={jigsaw} className={classes.planIcoTrue} />
          </div>
        </div>
      );
    } else if (/Intermediate/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planICON}>
            <img alt="planIco" src={bird} className={classes.planIcoTrue} />
          </div>
        </div>
      );
    } else if (/Pro/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planICON}>
            <img alt="planIco" src={divide} className={classes.planIcoTrue} />
          </div>
        </div>
      );
    } else if (/Personalized/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planICON}>
            <img alt="planIco" src={layer} className={classes.planIcoTrue} />
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <div className={classes.mainScreenTitle}>Account settings</div>
        <div className={classes.globalInfosData}>
          <div className={classes.inforBubble}>
            <div className={classes.placeholderData}>Company name</div>
            <div className={classes.fleshInfoData}>
              {this.props.App.userData.loginData.company_name}
            </div>
          </div>

          <div className={classes.inforBubble}>
            <div className={classes.placeholderData}>Account ID</div>
            <div className={classes.fleshInfoData}>
              {this.props.App.userData.loginData.company_fp
                .substring(0, 15)
                .toUpperCase()}
            </div>
          </div>

          <div className={classes.inforBubble}>
            <div className={classes.placeholderData}>Account manager</div>
            <div className={classes.fleshInfoData}>
              {this.props.App.userData.loginData.user_registerer.first_name}{" "}
              {this.props.App.userData.loginData.user_registerer.last_name}
            </div>
          </div>
          <div className={classes.inforBubble}>
            <div className={classes.placeholderData}>Phone</div>
            <div className={classes.fleshInfoData}>
              {this.props.App.userData.loginData.phone}
            </div>
          </div>
          <div className={classes.inforBubble}>
            <div className={classes.placeholderData}>Email</div>
            <div className={classes.fleshInfoData}>
              {this.props.App.userData.loginData.email}
            </div>
          </div>
        </div>

        {/* Plans infos */}
        <div className={classes.globalInfosData}>
          <div className={classes.genericBigTitle}>Plan</div>
          {this.props.App.userData.loginData.plans.subscribed_plan !== false &&
          this.props.App.userData.loginData.plans.isPlan_active ? (
            <div className={classes.planBubbleData}>
              <div className={classes.planImageContainer}>
                {this.renderAppropriateSidePlans()}
              </div>
              <div className={classes.planBriefInfosBalance}>
                <div className={classes.mainPlanTitle}>
                  {
                    this.planCodes[
                      this.props.App.userData.loginData.plans.subscribed_plan
                    ]
                  }
                </div>
                <div style={{ fontSize: 12 }}>
                  Balance
                  <br />
                  <span className={classes.balanceNumber}>
                    N${this.props.App.userData.loginData.wallet.balance}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: 50, paddingTop: 20 }}>
              No subscribed plans
            </div>
          )}
          {/* Change plan */}
          <div
            className={classes.formBasicButton}
            style={{ width: 200, marginBottom: 20 }}
            onClick={() => (window.location.href = "/plans")}
          >
            <div>Change my plan</div>
            <FiArrowRight />
          </div>
        </div>

        {/* Copyright */}
        <div className={classes.copyright}>
          TaxiConnect © 2020. All rights reserved.
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
      UpdateCurrentLocationMetadat,
      UpdateTripsData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
