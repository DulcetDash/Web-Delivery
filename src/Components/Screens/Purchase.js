import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateLoggingData } from "../../Redux/HomeActionsCreators";
import Header from "../Screens/Header";
import classes from "../../styles/Purchase.module.css";
import {
  MdTrendingFlat,
  MdInfo,
  MdHttps,
  MdAccessTime,
  MdDeleteSweep,
  MdNearMe,
  MdCheckCircle,
  MdReportProblem,
} from "react-icons/md";
import PlanNode from "./PlanNode";
import jigsaw from "../../Images/jigsaw.png";
import bird from "../../Images/bird.png";
import divide from "../../Images/divide.png";
import layer from "../../Images/layer.png";
import CreditCardInput from "react-credit-card-input";
import Loader from "react-loader-spinner";
import SOCKET_CORE from "../../Helper/managerNode";

class Purchase extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SOCKET_CORE = SOCKET_CORE;

    if (
      this.props.App.temporaryPackagePurchaseVars.planName === null ||
      this.props.App.temporaryPackagePurchaseVars.planName === undefined ||
      this.props.App.temporaryPackagePurchaseVars.amount === 0
    ) {
      window.location.href = "/plans";
    }

    this.state = {
      card_number: null,
      expiry: null,
      cvv: null,
      nameOnCard: null,
      showErrorsInput: false,
      isLoading: false,
      showResultOperations: false, //Whether or not to show the end operation result or not
      foundRequestError: false, //If found an error while processing the payment
    };
  }

  componentWillMount() {
    if (
      this.props.App.temporaryPackagePurchaseVars.planName === null ||
      this.props.App.temporaryPackagePurchaseVars.planName === undefined ||
      this.props.App.temporaryPackagePurchaseVars.amount === 0
    ) {
      window.location.href = "/plans";
    }
  }

  componentDidMount() {
    let globalObject = this;

    /**
     * SOCKET IO Handlers
     */
    /**
     * Handle to topup event response
     * event: topUp_wallet_io
     */
    this.SOCKET_CORE.on("topUp_wallet_io-response", function (dataReceived) {
      console.log(dataReceived);
      if (dataReceived !== undefined) {
        if (
          /success/i.test(dataReceived.response) &&
          dataReceived.response !== false
        ) {
          //Successful transation
          globalObject.setState({
            showResultOperations: true,
            foundRequestError: false,
          });
        } //An error occured
        else {
          globalObject.setState({
            showResultOperations: true,
            foundRequestError: true,
          });
        }
      } //Error
      else {
        globalObject.setState({
          showResultOperations: true,
          foundRequestError: true,
        });
      }
    });
  }

  renderAppropriateSidePlans(planSelected = "starter") {
    if (/starter/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planMainTitle}>Starter</div>
          <div className={classes.planICON}>
            <img alt="planIco" src={jigsaw} className={classes.planIcoTrue} />
          </div>
          <div className={classes.descrTextContainer}>
            Powerful logistic with easy setup.
          </div>
        </div>
      );
    } else if (/Intermediate/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planMainTitle}>Intermediate</div>
          <div className={classes.planICON}>
            <img alt="planIco" src={bird} className={classes.planIcoTrue} />
          </div>
          <div className={classes.descrTextContainer}>
            Grow your business with minimal setup.
          </div>
        </div>
      );
    } else if (/Pro/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planMainTitle}>Pro</div>
          <div className={classes.planICON}>
            <img alt="planIco" src={divide} className={classes.planIcoTrue} />
          </div>
          <div className={classes.descrTextContainer}>
            Scale your business seamlessly.
          </div>
        </div>
      );
    } else if (/Personalized/i.test(planSelected)) {
      return (
        <div className={classes.planPrimitiveContainer}>
          <div className={classes.planMainTitle}>Personalized</div>
          <div className={classes.planICON}>
            <img alt="planIco" src={layer} className={classes.planIcoTrue} />
          </div>
          <div className={classes.descrTextContainer}>
            Ultimate control and support for your team.
          </div>
        </div>
      );
    }
  }

  /**
   * @func execTopup()
   * Responsible for firing up the payement request to the corresponding service
   */
  execTopup() {
    if (
      this.state.card_number !== null &&
      this.state.card_number.length >= 16 &&
      this.state.cvv !== null &&
      this.state.cvv.length >= 3 &&
      this.state.expiry !== null &&
      this.state.expiry.length > 2 &&
      this.state.nameOnCard !== null &&
      this.state.nameOnCard.length > 0
    ) {
      //Good to go
      this.setState({
        isLoading: true,
        showErrorsInput: false,
      });
      //Make the payment
      let dataBundle = {
        user_fp: this.props.App.userData.loginData.company_fp,
        amount: this.props.App.temporaryPackagePurchaseVars.amount,
        number: this.state.card_number.replace(/ /g, ""),
        expiry: this.state.expiry.replace(" / ", ""),
        cvv: this.state.cvv,
        type: "cardType-nottaken",
        name: this.state.nameOnCard.trim().replace(/ /g, "_"),
        city:
          this.props.App.userCurrentLocationMetaData.city !== undefined &&
          this.props.App.userCurrentLocationMetaData.city !== null &&
          this.props.App.userCurrentLocationMetaData.city !== false
            ? this.props.App.userCurrentLocationMetaData.city
            : "Windhoek",
        country:
          this.props.App.userCurrentLocationMetaData.countrycode !==
            undefined &&
          this.props.App.userCurrentLocationMetaData.countrycode !== null &&
          this.props.App.userCurrentLocationMetaData.countrycode !== false
            ? this.props.App.userCurrentLocationMetaData.countrycode
            : "NA",
        request_globality: "corporate",
        plan_name: this.props.App.temporaryPackagePurchaseVars.planName,
      };
      //...
      this.SOCKET_CORE.emit("topUp_wallet_io", dataBundle);
    } else {
      if (this.cardData !== null) {
        this.highlightErrors();
      }
    }
  }

  highlightErrors() {
    this.setState({ showErrorsInput: true });
  }

  render() {
    return (
      <div className={classes.mainContainer}>
        <Header
          customButton={{
            show: true,
            title: "Back",
            action: () => {
              window.location.href = "/plans";
            },
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {this.state.showResultOperations === false ? (
            <div className={classes.contentContainer}>
              <div className={classes.mainTitle}>
                <div>Purchase your package</div>
                <div></div>
              </div>
              <div
                className={classes.subMainTitle}
                onClick={() => (window.location.href = "/plans")}
              >
                Or choose another package{" "}
                <MdTrendingFlat
                  style={{ position: "relative", top: 1, marginLeft: 5 }}
                />
              </div>

              {/* Payment */}
              <div className={classes.paymentPrimitiveContainer}>
                <div className={classes.paymentSide}>
                  {this.state.showErrorsInput ? (
                    <div className={classes.infosErrorShow}>
                      The information entered looks incorrect, please review
                      them.
                    </div>
                  ) : (
                    <div className={classes.infosErrorShow}></div>
                  )}

                  <CreditCardInput
                    cardNumberInputProps={{
                      value: this.state.card_number,
                      onChange: (value) =>
                        this.setState({
                          card_number: value.target.value,
                          showErrorsInput: false,
                        }),
                    }}
                    cardExpiryInputProps={{
                      value: this.state.expiry,
                      onChange: (value) =>
                        this.setState({
                          expiry: value.target.value,
                          showErrorsInput: false,
                        }),
                    }}
                    cardCVCInputProps={{
                      value: this.state.cvv,
                      onChange: (value) =>
                        this.setState({
                          cvv: value.target.value,
                          showErrorsInput: false,
                        }),
                    }}
                    fieldClassName="inputCard"
                    containerStyle={{
                      border: "1px solid #d0d0d0",
                      borderRadius: 3,
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Name on the card"
                    onChange={(text) =>
                      this.setState({ nameOnCard: text.target.value })
                    }
                    className={classes.formBasicInput}
                  />

                  <div className={classes.infosRefs}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <MdInfo
                        style={{
                          width: 25,
                          height: 25,
                          marginRight: 7,
                          bottom: 5,
                          position: "relative",
                        }}
                      />
                      <div>
                        Please insert your payment details, and note that by
                        performing this payment you agree to our{" "}
                        <span style={{ fontWeight: "bold" }}>
                          terms and conditions
                        </span>
                        .
                        <br />
                        You also agree to receive any related emails from us
                        with details of your purchases.
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginTop: 20,
                        color: "#000",
                      }}
                    >
                      <MdHttps
                        style={{
                          width: 15,
                          height: 15,
                          marginRight: 7,
                          bottom: 1,
                          position: "relative",
                          color: "#09864A",
                        }}
                      />{" "}
                      All the information entered is secure.
                    </div>
                  </div>

                  <div
                    className={classes.formBasicSubmitBttn}
                    onClick={() => this.execTopup()}
                  >
                    {this.state.isLoading === false ? (
                      <>
                        Purchase - N$
                        {this.props.App.temporaryPackagePurchaseVars.amount}
                      </>
                    ) : (
                      <Loader
                        type="TailSpin"
                        color="#fff"
                        height={27}
                        width={27}
                        timeout={300000000} //3 secs
                      />
                    )}
                  </div>
                </div>
                {/* Plan overview */}
                <div className={classes.planSide}>
                  {this.renderAppropriateSidePlans(
                    this.props.App.temporaryPackagePurchaseVars.planName
                  )}
                </div>
              </div>
            </div>
          ) : this.state.foundRequestError === false ? (
            <div
              style={{
                //   border: "1px solid black",
                display: "flex",
                height: 500,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                margin: "auto",
                width: "50%",
                textAlign: "center",
              }}
            >
              <MdCheckCircle
                style={{ width: 55, height: 55, marginBottom: 25 }}
                color={"#09864A"}
              />
              Your purchase has been made successfully.
              <div
                style={{
                  fontFamily: "MoveBold, sans-serif",
                  fontSize: "25px",
                  marginTop: 40,
                }}
              >
                N${this.props.App.temporaryPackagePurchaseVars.amount}
              </div>
              <div
                className={classes.formBasicSubmitBttnClassicsReceiverInfos}
                style={{ marginTop: 60, borderRadius: 3 }}
                onClick={() => {
                  window.location.href = "/Delivery";
                }}
              >
                Let's go
              </div>
            </div>
          ) : (
            <div
              style={{
                //   border: "1px solid black",
                display: "flex",
                height: 500,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                margin: "auto",
                width: "50%",
                textAlign: "center",
              }}
            >
              <MdReportProblem
                style={{ width: 35, height: 35, marginBottom: 25 }}
                color={"#b22222"}
              />
              Sorry we were unable to process your purchase due to an unexpected
              error, please refresh you web page and try again. If it persists
              please contact us at <strong>support@taxiconnectna.com</strong>
              <div
                className={classes.formBasicSubmitBttnClassicsReceiverInfos}
                style={{ marginTop: 60, borderRadius: 3 }}
                onClick={() => {
                  window.location.href = "/Purchase";
                }}
              >
                Retry
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={classes.footer}>
            <div className={classes.copyrightText}>
              TaxiConnect © 2020. All rights reserved.
            </div>
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Purchase);
