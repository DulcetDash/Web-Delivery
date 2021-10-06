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

class PresentPlans extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <Header
          customButton={{
            show: true,
            title: "Skip for now",
            action: () => {
              window.location.href = "/Delivery";
            },
          }}
        />
        <div className={classes.mainTitle}>Business friendly pricing</div>
        <div className={classes.subMainTitle}>
          Let’s find a package that’s right for you.
        </div>
        <div className={classes.plansContainer}>
          <PlanNode
            planName={"Starter"}
            description={"Powerful logistic with easy setup"}
            priceSmallBreakdown={"2 deliveries for about N$50 per delivery."}
            price={"N$100"}
            icon={jigsaw}
            paymentPeriod={""}
            marginRight={20}
            isActive
            featuresList={[
              { title: "1 batch delivery" },
              { title: "5 destinations at once" },
              { title: "Deliveries graph" },
              { title: "24/7h support" },
            ]}
            actionGetStartedButton={() => {
              //! Update the redux corresponding vars - temporaryPackagePurchaseVars
              this.props.UpdatePlanPurchaseData({
                planName: "Starter",
                amount: 100,
              });
              //...
              window.location.href = "/Purchase";
            }}
          />
          <PlanNode
            planName={"Intermediate"}
            description={"Grow your business with minimal setup"}
            price={"N$2500"}
            icon={bird}
            titleFeatures={
              <span>
                All features from{" "}
                <span style={{ fontFamily: "MoveTextBold, sans-serif" }}>
                  Starter
                </span>{" "}
                +
              </span>
            }
            priceSmallBreakdown={"50 deliveries for about N$50 per delivery."}
            paymentPeriod={""}
            marginRight={20}
            isRecommended
            isActive
            featuresList={[
              { title: "15 batch deliveries" },
              { title: "15 destinations at once" },
              // {
              //   title: "Demand predictions",
              // },
              // {
              //   title: "Advanced historical analytics",
              // },
            ]}
            actionGetStartedButton={() => {
              //! Update the redux corresponding vars - temporaryPackagePurchaseVars
              this.props.UpdatePlanPurchaseData({
                planName: "Intermediate",
                amount: 2500,
              });
              //...
              // console.log(this.props.App.temporaryPackagePurchaseVars);
              window.location.href = "/Purchase";
            }}
          />
          <PlanNode
            planName={"Pro"}
            description={"Scale your business seamlessly"}
            price={"N$15000"}
            icon={divide}
            titleFeatures={
              <span>
                All features from{" "}
                <span style={{ fontFamily: "MoveTextBold, sans-serif" }}>
                  Intermediate
                </span>{" "}
                +
              </span>
            }
            priceSmallBreakdown={"300 deliveries for about N$50 per delivery."}
            paymentPeriod={""}
            marginRight={20}
            featuresList={[
              { title: "50 batch deliveries" },
              { title: "20 destinations at once" },
              {
                title: "Financial forecasting",
              },
            ]}
            actionGetStartedButton={() => {
              //! Update the redux corresponding vars - temporaryPackagePurchaseVars
              this.props.App.temporaryPackagePurchaseVars.planName = "Pro";
              this.props.App.temporaryPackagePurchaseVars.amount = 15000;
              //...
              window.location.href = "/Purchase";
            }}
          />
          <PlanNode
            planName={"Personalized"}
            description={"Ultimate control and support for your team"}
            price={"Custom"}
            icon={layer}
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
              { title: "100+ batch deliveries" },
              { title: "30+ destinations at once" },
              {
                title: "Custom tools made for you",
              },
            ]}
          />
        </div>
        {/* Footer */}
        <div className={classes.footer}>
          <div className={classes.copyrightText}>
            TaxiConnect © 2020. All rights reserved.
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
      UpdateLoggingData,
      UpdatePlanPurchaseData,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PresentPlans);
