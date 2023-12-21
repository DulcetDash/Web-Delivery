import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateCurrentLocationMetadat,
  UpdateTripsData,
} from "../../Redux/HomeActionsCreators";
import classes from "../../styles/Settings.module.css";
import { FiArrowRight } from "react-icons/fi";
import jigsaw from "../../Images/jigsaw.png";
import bird from "../../Images/bird.png";
import divide from "../../Images/divide.png";
import layer from "../../Images/layer.png";
import { CORAL_RED, PRIMARY, SECONDARY } from "../../Helper/Colors";
import { Button, Input, InputNumber, Modal, Result, Tag } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import Pay from "./Payment/Payment";
import axios from "axios";
import Loader from "../../Helper/Loader/Loader";
import { MdCheckCircle } from "react-icons/md";
import { getAmountWithFees } from "../../Helper/Utils";

class Settings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.planCodes = {
      STR: "Starter",
      ITMD: "Intermediate",
      PR: "Pro",
      PRSNLD: "Personalised",
    };

    this.state = {
      isLoading: true, //If something is loading or not
      showTopupModal: false,
      showTopUpPayment: false, //The part where the customer has to enter card details.
      isTopUpPaymentLoading: false, //If the top up payment is loading or not
      isPaymentSuccessful: false, //If the top up payment was successful or not
      topUpAmount: 100, //The amount to top up
      clientSecret: null,
    };
  }

  componentDidMount() {
    let globalObject = this;

    //Handle socket io events
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

  getDeliveryAmount() {
    return Math.floor(this.state.topUpAmount / 50);
  }

  isAmountValid() {
    return (
      this.state.topUpAmount !== 0 &&
      this.state.topUpAmount >= 10 &&
      this.state.topUpAmount
    );
  }

  createOneOffPaymentIntent = async () => {
    if (this.state.isTopUpPaymentLoading) return;

    this.setState({ isTopUpPaymentLoading: true });

    const userData = this.props.App.userData.loginData;

    try {
      const subscription = await axios.post(
        `${process.env.REACT_APP_URL}/oneoff_payment`,
        {
          price: this.state.topUpAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.company_fp}`,
          },
          withCredentials: true,
        }
      );

      if (
        subscription?.data?.status === "success" &&
        subscription?.data?.clientSecret
      ) {
        this.setState({
          clientSecret: subscription?.data?.clientSecret,
          isTopUpPaymentLoading: false,
          showTopUpPayment: true,
        });
      } else {
        this.setState({
          isTopUpPaymentLoading: false,
          showTopUpPayment: false,
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({ isTopUpPaymentLoading: false, showTopUpPayment: false });
    }
  };

  render() {
    return (
      <div className={classes.mainContainer}>
        <Modal
          title={!this.state.isPaymentSuccessful ? "Top-up your balance" : null}
          open={this.state.showTopupModal}
          onOk={async () => {
            if (!this.state.showTopUpPayment && this.isAmountValid()) {
              await this.createOneOffPaymentIntent();
            }
          }}
          okText={
            this.state.isTopUpPaymentLoading ? (
              <Loader size={15} color="#000" />
            ) : (
              "Continue"
            )
          }
          okButtonProps={{
            disabled: !this.isAmountValid() || this.state.isTopUpPaymentLoading,
            style: {
              display:
                this.state.showTopUpPayment || this.state.isPaymentSuccessful
                  ? "none"
                  : "inline-block",
            },
          }}
          cancelButtonProps={{
            style: {
              display:
                this.state.showTopUpPayment || this.state.isPaymentSuccessful
                  ? "none"
                  : "inline-block",
            },
          }}
          onCancel={() => this.setState({ showTopupModal: false })}
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            right: 0,
            bottom: 0,
          }}>
          {!this.state.showTopUpPayment && !this.state.isPaymentSuccessful && (
            <div style={{ marginTop: 25 }}>
              <InputNumber
                placeholder="Amount"
                prefix="N$"
                title="Amount"
                maxLength={5}
                size={"large"}
                style={{ width: "100%" }}
                value={this.state.topUpAmount}
                onChange={(value) =>
                  this.setState({
                    topUpAmount: value,
                  })
                }
              />

              <div style={{ marginTop: 20, marginBottom: 80 }}>
                {this.isAmountValid() ? (
                  <>
                    <InfoCircleFilled style={{ color: PRIMARY }} /> You get
                    about{" "}
                    <strong style={{ color: PRIMARY }}>
                      {this.getDeliveryAmount()} deliverie
                      {this.getDeliveryAmount() !== 1 ? "s" : ""}
                    </strong>
                  </>
                ) : (
                  <div style={{ color: CORAL_RED }}>
                    <InfoCircleFilled /> The minimum top-up is{" "}
                    <strong style={{ color: CORAL_RED }}>N$100</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {this.state.showTopUpPayment &&
            this.state.clientSecret &&
            !this.state.isPaymentSuccessful && (
              <div>
                <Pay
                  clientSecret={this.state.clientSecret}
                  priceId={""}
                  selectedPlan={{
                    planName: "Top-up",
                    amount: getAmountWithFees(this.state.topUpAmount),
                  }}
                  confirmSetupIntent={""}
                  parentState={this}
                />
              </div>
            )}

          {this.state.isPaymentSuccessful && (
            <div>
              <Result
                icon={
                  <MdCheckCircle style={{ fontSize: "4em", color: PRIMARY }} />
                }
                status="success"
                title={
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.1em",
                        marginBottom: 15,
                      }}>
                      N${this.state.topUpAmount}
                    </div>
                    <div style={{ color: "black", marginBottom: 20 }}>
                      Successfully purchased
                    </div>
                  </div>
                }
                subTitle="We'll email your the invoice having your order details shortly."
                extra={[
                  <Button
                    style={{
                      borderColor: SECONDARY,
                      backgroundColor: SECONDARY,
                      color: "white",
                      fontWeight: "bold",
                      height: 45,
                      fontSize: "1.1em",
                      width: 200,
                      marginTop: 20,
                    }}
                    onClick={() =>
                      this.setState({
                        showTopupModal: false,
                        topUpAmount: 100,
                        showTopUpPayment: false,
                        isPaymentSuccessful: false,
                        clientSecret: null,
                      })
                    }
                    key="console">
                    Done
                  </Button>,
                ]}
              />
            </div>
          )}
        </Modal>

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
              {this.props.App.userData.loginData.user_registerer.firstName}{" "}
              {this.props.App.userData.loginData.user_registerer.lastName}
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
          <div className={classes.genericBigTitle}>
            Your plan{" "}
            {this.props.App.userData.loginData?.plans?.subscribed_plan !==
              false &&
            this.props.App.userData.loginData?.plans?.isPlan_active ? (
              ""
            ) : (
              <Tag style={{ fontSize: 16 }}>
                Balance: N$
                {this.props.App.userData.loginData?.plans?.balance}
              </Tag>
            )}
          </div>
          {this.props.App.userData.loginData.plans.subscribed_plan !== false &&
          this.props.App.userData.loginData.plans.isPlan_active ? (
            <div className={classes.planBubbleData}>
              <div className={classes.planImageContainer}>
                {this.props.App.userData.loginData.plans.subscribed_plan !==
                  false &&
                this.props.App.userData.loginData.plans.subscribed_plan !==
                  "false"
                  ? this.renderAppropriateSidePlans(
                      this.planCodes[
                        this.props.App.userData.loginData.plans.subscribed_plan
                      ]
                    )
                  : "Purchase a package"}
              </div>
              <div className={classes.planBriefInfosBalance}>
                <div className={classes.mainPlanTitle}>
                  {this.props.App.userData.loginData.plans.subscribed_plan !==
                    false &&
                  this.props.App.userData.loginData.plans.subscribed_plan !==
                    "false"
                    ? this.planCodes[
                        this.props.App.userData.loginData.plans.subscribed_plan
                      ]
                    : "No package"}
                </div>
                <div style={{ fontSize: 12 }}>
                  Balance
                  <br />
                  <span className={classes.balanceNumber}>
                    N$
                    {this.props.App.userData?.loginData?.plans?.balance ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: 50, paddingTop: 20 }}>
              No purchased package
            </div>
          )}
          {/* Change plan */}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              className={classes.formBasicButton}
              style={{ width: 200, marginBottom: 20 }}
              onClick={() => (window.location.href = "/plans")}>
              <div>
                {this.props.App.userData.loginData.plans.subscribed_plan !==
                  false && this.props.App.userData.loginData.plans.isPlan_active
                  ? "Change my subscription"
                  : "Add a subscription"}
              </div>
              <FiArrowRight />
            </div>
            <div
              className={classes.formBasicButton}
              style={{
                width: 200,
                marginBottom: 20,
                marginLeft: 20,
                backgroundColor: PRIMARY,
                borderColor: PRIMARY,
              }}
              onClick={() =>
                this.setState({
                  showTopupModal: true,
                })
              }>
              <div>Top-up your balance</div>
              <FiArrowRight />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={classes.copyright}>
          DulcetDash © 2023. All rights reserved.
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
