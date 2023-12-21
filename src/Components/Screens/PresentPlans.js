import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  UpdateLoggingData,
  UpdatePlanPurchaseData,
} from "../../Redux/HomeActionsCreators";
import Header from "../Screens/Header";
import classes from "../../styles/Plans.module.css";
import PlanNode from "./PlanNode";
import jigsaw from "../../Images/jigsaw.png";
import bird from "../../Images/bird.png";
import divide from "../../Images/divide.png";
import layer from "../../Images/layer.png";
import axios from "axios";
import Pay from "./Payment/Payment";
import { MdCheckCircle, MdTrendingFlat } from "react-icons/md";
import { Button, Result } from "antd";
import { PRIMARY, SECONDARY } from "../../Helper/Colors";
import Promotion from "../../Helper/Plans/Promotion";
import toast from "react-hot-toast";
import { getCorrectPriceId } from "../../Helper/Utils";

class PresentPlans extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      clientSecret: null,
      plan: null,
      isPaymentSuccessful: null, //Default: null
      isLoadingPlanSelected: false,
    };
  }

  createSubscriptionIntent = async (priceId) => {
    if (this.state.isLoadingPlanSelected) return;

    this.setState({ isLoadingPlanSelected: true });

    const userData = this.props.App.userData.loginData;

    try {
      const subscription = await axios.post(
        `${process.env.REACT_APP_URL}/subscription`,
        {
          customerId: userData?.stripe_customerId,
          priceId: priceId,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.company_fp}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (
        subscription?.data?.status === "success" &&
        typeof subscription?.data?.clientSecret === "string"
      ) {
        this.setState({
          clientSecret: subscription?.data?.clientSecret,
          isLoadingPlanSelected: false,
        });
      } else {
        toast.error("An unexpected error occured, please try again");
        this.setState({ isLoadingPlanSelected: false });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occured, please try again");
      this.setState({ isLoadingPlanSelected: false });
    }
  };

  render() {
    const subscribedPlan =
      this.props.App?.userData?.loginData?.plans?.subscribed_plan?.toLowerCase() ??
      "noplan";
    return (
      <div className={classes.mainContainer}>
        <Header
          customButton={{
            show: true,
            title: this.props.App?.userData?.loginData?.plans?.isPlan_active
              ? "Back to Dashboard"
              : "Skip for now",
            action: () => {
              window.location.href = "/Delivery";
            },
          }}
        />
        {this.state.isPaymentSuccessful === true ? (
          <div style={{ marginTop: 40 }}>
            <Result
              icon={
                <MdCheckCircle style={{ fontSize: "6em", color: PRIMARY }} />
              }
              status="success"
              title={
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.5em",
                      marginBottom: 15,
                    }}>
                    N${this.state.plan?.amount}
                  </div>
                  <div style={{ color: "black", marginBottom: 20 }}>
                    {this.state.plan?.planName}
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
                  onClick={() => (window.location.href = "/Delivery")}
                  key="console">
                  Go to Dashboard
                </Button>,
              ]}
            />
          </div>
        ) : this.state.clientSecret ? (
          <>
            <div
              className={classes.subMainTitleX}
              onClick={() =>
                this.setState({
                  clientSecret: null,
                })
              }>
              Or choose another package{" "}
              <MdTrendingFlat
                style={{ position: "relative", top: 1, marginLeft: 5 }}
              />
            </div>
            <Pay
              clientSecret={this.state.clientSecret}
              selectedPlan={this.state.plan}
              confirmSetupIntent={""}
              parentState={this}
            />
          </>
        ) : (
          <>
            <div className={classes.mainTitle}>Business friendly pricing</div>
            <div className={classes.subMainTitle}>
              Let’s find a package that’s right for you.
            </div>
            <div className={classes.plansContainer}>
              <PlanNode
                planName={"Starter"}
                description={"Powerful logistic with easy setup"}
                priceSmallBreakdown={"Get about 2 deliveries."}
                price={"N$100"}
                isSubscribed={subscribedPlan === "starter"}
                icon={jigsaw}
                paymentPeriod={""}
                marginRight={20}
                isActive
                isLoading={
                  this.state.plan?.planName === "Starter" &&
                  this.state.isLoadingPlanSelected
                }
                featuresList={[
                  { title: "Unlimited deliveries" },
                  { title: "5 destinations at once" },
                  { title: "SMS notification to clients" },
                  { title: "Tracking" },
                  { title: "24/7h support" },
                ]}
                actionGetStartedButton={async () => {
                  //! Update the redux corresponding vars - temporaryPackagePurchaseVars
                  let basePrice = 100;
                  let transactionFees = basePrice * 0.04;
                  basePrice += transactionFees;

                  this.props.UpdatePlanPurchaseData({
                    planName: "Starter",
                    amount: basePrice,
                  });

                  this.setState({
                    plan: {
                      planName: "Starter",
                      amount: basePrice,
                    },
                  });
                  //...
                  await this.createSubscriptionIntent(
                    getCorrectPriceId("starter")
                  );
                }}
              />
              <PlanNode
                planName={"Intermediate"}
                description={"Grow your business with minimal setup"}
                price={"N$2500"}
                icon={bird}
                isSubscribed={subscribedPlan === "intermediate"}
                titleFeatures={
                  <span>
                    All features from{" "}
                    <span style={{ fontFamily: "MoveTextBold, sans-serif" }}>
                      Starter
                    </span>{" "}
                    +
                  </span>
                }
                priceSmallBreakdown={"Get about 50 deliveries."}
                paymentPeriod={""}
                marginRight={20}
                isRecommended
                isActive
                isLoading={
                  this.state.plan?.planName === "Intermediate" &&
                  this.state.isLoadingPlanSelected
                }
                featuresList={[
                  { title: "Unlimited deliveries" },
                  { title: "10 destinations at once" },
                  {
                    title: "Invoices",
                  },
                ]}
                actionGetStartedButton={async () => {
                  //! Update the redux corresponding vars - temporaryPackagePurchaseVars
                  let basePrice = 2500;
                  let transactionFees = basePrice * 0.04;
                  basePrice += transactionFees;

                  this.props.UpdatePlanPurchaseData({
                    planName: "Intermediate",
                    amount: basePrice,
                  });
                  //...
                  this.setState({
                    plan: {
                      planName: "Intermediate",
                      amount: basePrice,
                    },
                  });
                  //...
                  await this.createSubscriptionIntent(
                    getCorrectPriceId("intermediate")
                  );
                }}
              />
              <PlanNode
                planName={"Pro"}
                description={"Scale your business seamlessly"}
                price={"N$15000"}
                icon={divide}
                isSubscribed={subscribedPlan === "pro"}
                isActive
                isLoading={
                  this.state.plan?.planName === "Pro" &&
                  this.state.isLoadingPlanSelected
                }
                titleFeatures={
                  <span>
                    All features from{" "}
                    <span style={{ fontFamily: "MoveTextBold, sans-serif" }}>
                      Intermediate
                    </span>{" "}
                    +
                  </span>
                }
                priceSmallBreakdown={"Get about 300 deliveries."}
                paymentPeriod={""}
                marginRight={20}
                featuresList={[
                  { title: "Unlimited deliveries" },
                  { title: "15 destinations at once" },
                  {
                    title: "Invoices",
                  },
                ]}
                actionGetStartedButton={async () => {
                  //! Update the redux corresponding vars - temporaryPackagePurchaseVars
                  let basePrice = 15000;
                  let transactionFees = basePrice * 0.04;
                  basePrice += transactionFees;

                  this.props.UpdatePlanPurchaseData({
                    planName: "Pro",
                    amount: basePrice,
                  });
                  //...
                  this.setState({
                    plan: {
                      planName: "Pro",
                      amount: basePrice,
                    },
                  });
                  //...
                  await this.createSubscriptionIntent(getCorrectPriceId("pro"));
                  window.location.href = "/Purchase";
                }}
              />
              <PlanNode
                planName={"Personalized"}
                description={"Ultimate control and support for your team"}
                price={"Custom"}
                icon={layer}
                isActive
                titleFeatures={
                  <span>
                    All features from{" "}
                    <span style={{ fontFamily: "MoveTextBold, sans-serif" }}>
                      Pro
                    </span>{" "}
                    +
                  </span>
                }
                priceSmallBreakdown={
                  "Custom deliveries above 300 and analytics tool."
                }
                buttonTitle={"Contact sales"}
                featuresList={[
                  { title: "Unlimited deliveries" },
                  { title: "30+ destinations at once" },
                  {
                    title: "Advanced analytics",
                  },
                ]}
                actionGetStartedButton={() =>
                  (window.location = "mailto:support@dulcetdash.com")
                }
              />
            </div>
            {/* Footer */}
            <div className={classes.footer}>
              <div className={classes.copyrightText}>
                DulcetDash © 2023. All rights reserved.
              </div>
            </div>
          </>
        )}
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
      UpdateLoggingData,
      UpdatePlanPurchaseData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PresentPlans);
