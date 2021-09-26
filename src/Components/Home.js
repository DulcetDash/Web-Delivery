import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UpdateLoggingData } from "../Redux/HomeActionsCreators";
import Header from "./Screens/Header";
import Industries from "../Helper/Industries";
import EmailValidator from "../Helper/EmailValidator";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import {
  AiTwotoneSafetyCertificate,
  AiOutlineLeft,
  AiFillShop,
  AiOutlineRight,
} from "react-icons/ai";
import SOCKET_CORE from "../Helper/managerNode";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import classes from "../styles/Home.module.css";
import Countdown from "react-countdown";
import savingMoney from "../Images/saving-money.png";
import workflow from "../Images/workflow.png";
import analysis from "../Images/analysis.png";

class Home extends React.PureComponent {
  constructor(props) {
    super(props);

    this.redirectBasedOnState();

    this.SOCKET_CORE = SOCKET_CORE;

    this.state = {
      shouldShowLogin: false, //If to render the login form
      shouldShowSMSAuth: false, //Whether or not to show the SMS checking
      isLoading: false, //If it's in a loading state
      hasErrorHappened: false, //If an error happened while loading
      isLoadingResendSMS: false, //Whether the resend sms is working or not.
      shouldShowAccountCreated: false, //Whether or not to show when the account is created
      shouldShowChangePhoneNumber: false, //Whether to show the changing phone number window
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      company_name: "",
      industry: "",
      password: "",
      password_confirm: "",
      otp: "",
      //...
      firstname_error_color: "#d0d0d0", //white or red when error
      lastname_error_color: "#d0d0d0",
      email_error_color: "#d0d0d0",
      phone_error_color: "#d0d0d0",
      company_name_error_color: "#d0d0d0",
      industry_error_color: "#d0d0d0",
      password_error_color: "#d0d0d0",
      password_confirm_error_color: "#d0d0d0",
      otp_error_color: "#d0d0d0",
      //...
      error_text_reported: `An unexpected error occured, please try again later. Or if it
      persists please refresh this page and give it a try again.`,
    };
  }

  /**
   * ! Redirect pages based on state
   */
  redirectBasedOnState() {
    if (
      this.props.App.userData.loginData === null ||
      this.props.App.userData.loginData === undefined ||
      this.props.App.userData.loginData.company_fp === undefined ||
      this.props.App.userData.loginData.company_fp === null
    ) {
      //stay
    } else if (
      this.props.App.userData.loginData.account.confirmations
        .isPhoneConfirmed === false
    ) {
      //Leave like that
    } else if (
      this.props.App.userData.loginData.company_fp !== undefined &&
      this.props.App.userData.loginData.account.confirmations.isPhoneConfirmed
    ) {
      //Move to plans
      window.location.href = "/plans";
      console.log(this.props.App.userData.loginData);
    } //Stay
    else {
    }
  }

  //! Deprecated?
  componentWillMount() {
    this.redirectBasedOnState();
  }

  componentDidMount() {
    this.redirectBasedOnState();

    // console.log(this.props.App);
    let globalObject = this;

    //Handle socket Events
    this.SOCKET_CORE.on(
      "opsOnCorpoDeliveryAccounts_io-response",
      function (response) {
        // console.log(response);
        globalObject.state.isLoading = false;
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/error/i.test(response.response)) {
            //An error occured
            if (/alreadyExists/i.test(response.response)) {
              //A similar account already exists
              globalObject.setState({
                error_text_reported: `Sorry it appears to us that a similar account already exists, if it yours maybe try to login or if you think that this is a mistake, please scroll all the way down and click on "Support" to get help.`,
                hasErrorHappened: true,
              });
            } else if (/error_creating_account/i.test(response.response)) {
              //Error creating account
              globalObject.setState({
                error_text_reported: `Due to an unexpected error, we were unable to create your account, please try again later. Or if it
              persists please refresh this page and give it a try again.`,
                hasErrorHappened: true,
              });
            } else if (/^error_logging_in$/i.test(response.response)) {
              //Error logging in
              globalObject.setState({
                error_text_reported: `Due to an unexpected error, we were unable to log you in, please try again later. Or if it
              persists please refresh this page and give it a try again.`,
                hasErrorHappened: true,
              });
            } else if (
              /error_logging_in_notFoundAccount/i.test(response.response)
            ) {
              //Account not found
              globalObject.setState({
                error_text_reported: `Oups looks like you don't have yet an account with us? If that's the case, press on "Back", and "Log in" to create a fresh account for free. If you think that this is a mistake, please scroll all the way down and click on "Support" to get help.`,
                hasErrorHappened: true,
              });
            }
            //Unknown error
            else {
              globalObject.setState({
                error_text_reported: `An unexpected error occured, please try again later. Or if it
          persists please refresh this page and give it a try again.`,
                hasErrorHappened: true,
              });
            }
          } //No error occured
          else {
            console.log(response);
            if (/successfully_created/i.test(response.response)) {
              //SUCCESS
              globalObject.props.UpdateLoggingData(response.metadata);
              globalObject.setState({
                shouldShowAccountCreated: true,
              });
            } else if (/successfully_logged_in/i.test(response.response)) {
              //SUCCESS
              globalObject.props.UpdateLoggingData(response.metadata);
              globalObject.makeSoftResetOnCurrentState();
              //Check if the number was already verified or not
              if (
                response.metadata.account === undefined ||
                response.metadata.account === null ||
                response.metadata.account.confirmations.isPhoneConfirmed ===
                  false
              ) {
                globalObject.resendConfirmationSMSAgain();
                //Phone not yet verified
                globalObject.setState({
                  shouldShowSMSAuth: true,
                  hasErrorHappened: false,
                });
              }
              //? Move forward
              else {
                globalObject.setState({
                  isLoading: true,
                });
                window.location.href = "/plans";
              }
            }
            //An error occured
            else {
              globalObject.setState({
                error_text_reported: `An unexpected error occured, please try again later. Or if it
          persists please refresh this page and give it a try again.`,
                hasErrorHappened: true,
              });
            }
          }
        } //Unexpected error
        else {
          globalObject.setState({
            error_text_reported: `An unexpected error occured, please try again later. Or if it
          persists please refresh this page and give it a try again.`,
            hasErrorHappened: true,
          });
        }
      }
    );

    //Handle resend confirmation SMS
    this.SOCKET_CORE.on(
      "resetConfirmationSMSDeliveryWeb_io-response",
      function (response) {
        // console.log(response);
        globalObject.setState({ isLoadingResendSMS: false });

        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/successfully_sent/i.test(response.response)) {
            //Success
            //Do noting for now as well
          } //An error occured
          else {
            //Do nothing for now
          }
        }
      }
    );

    //Handle validating phone number via OTP SMS
    this.SOCKET_CORE.on(
      "validatePhoneNumberDeliveryWeb_io-response",
      function (response) {
        // console.log(response);
        globalObject.setState({ isLoading: false });

        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/successfully_validated/i.test(response.response)) {
            //Success
            //Do noting for now as well
            globalObject.props.UpdateLoggingData(response.metadata);
            //? Move forward
            window.location.href = "/plans";
          } //An error occured
          else {
            //Do nothing for now
            if (/invalid_code/i.test(response.response)) {
              //Wrong code
              globalObject.setState({
                error_text_reported: `Sorry the code that you've entered is not correct, please check through your SMS to get the valid 6-digits code sent from us, or press "Back" and send the code again, thank you.`,
                hasErrorHappened: true,
              });
            } //Some other unexpected error
            else {
              globalObject.setState({
                error_text_reported: `An unexpected error occured, please try again later. Or if it
              persists please refresh this page and give it a try again.`,
                hasErrorHappened: true,
              });
            }
          }
        }
      }
    );

    //Handle updating the phone number on mistake
    this.SOCKET_CORE.on(
      "updatePhoneNumberDeliveryWeb_io-response",
      function (response) {
        // console.log(response);
        globalObject.setState({ isLoading: false });

        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/successfully_updated/i.test(response.response)) {
            //Success
            //Do noting for now as well
            globalObject.props.UpdateLoggingData(response.metadata);
            //? Send new code and back to SMS auth
            globalObject.resendConfirmationSMSAgain();
            globalObject.setState({
              hasErrorHappened: false,
              shouldShowSMSAuth: true,
            });
          } //An error occured
          else {
            //Do nothing for now
            globalObject.setState({
              error_text_reported: `An unexpected error occured, please try again later. Or if it
            persists please refresh this page and give it a try again.`,
              hasErrorHappened: true,
            });
          }
        }
      }
    );
  }

  /**
   * Render the proper actions based on the state of the form : login/sign up
   */
  executeProperStateAction() {
    this.restoreBorderToNoErrorStatus();

    if (this.state.shouldShowLogin === false) {
      //Signup
      if (
        this.state.firstname.length > 0 &&
        this.state.firstname !== undefined
      ) {
        //Good
        if (
          this.state.lastname.length > 0 &&
          this.state.lastname !== undefined
        ) {
          //Good
          if (isValidPhoneNumber(this.state.phone)) {
            //Valid phone
            if (
              this.state.company_name.length > 0 &&
              this.state.company_name !== undefined
            ) {
              //All good
              if (EmailValidator(this.state.email)) {
                if (
                  this.state.industry !== "Industry" &&
                  this.state.industry.length > 0 &&
                  this.state.industry !== undefined
                ) {
                  //Good
                  //Good
                  if (
                    this.state.password.length > 0 &&
                    this.state.password !== undefined
                  ) {
                    if (this.state.password === this.state.password_confirm) {
                      //! ALL GOOD
                      //Good
                      // console.log("All good");
                      this.setState({ isLoading: true });
                      this.SOCKET_CORE.emit("opsOnCorpoDeliveryAccounts_io", {
                        op: "signup",
                        email: this.state.email,
                        first_name: this.state.firstname,
                        last_name: this.state.lastname,
                        phone: this.state.phone,
                        company_name: this.state.company_name,
                        selected_industry: this.state.industry,
                        password: this.state.password,
                      });
                    } //Not same passwords
                    else {
                      this.setState({ password_confirm_error_color: "red" });
                    }
                  } //Empty
                  else {
                    this.setState({ password_error_color: "red" });
                  }
                } //No industry selected
                else {
                  this.setState({ industry_error_color: "red" });
                }
              } //Invalid
              else {
                this.setState({ email_error_color: "red" });
              }
            } //No company name entered
            else {
              this.setState({ company_name_error_color: "red" });
            }
          } //Invalid phone
          else {
            this.setState({ phone_error_color: "red" });
          }
        } //Empty
        else {
          this.setState({ lastname_error_color: "red" });
        }
      } //Empty
      else {
        this.setState({ firstname_error_color: "red" });
      }
    } //? Log in
    else {
      if (EmailValidator(this.state.email)) {
        //Good
        if (
          this.state.password.length > 0 &&
          this.state.password !== undefined
        ) {
          //Good
          // console.log("All good, login");
          this.setState({ isLoading: true });
          this.SOCKET_CORE.emit("opsOnCorpoDeliveryAccounts_io", {
            op: "login",
            email: this.state.email,
            password: this.state.password,
          });
        } //Empty
        else {
          this.setState({ password_error_color: "red" });
        }
      } //Invalid
      else {
        this.setState({ email_error_color: "red" });
      }
    }
  }

  /**
   * Responsible for resetting the borders to their normal color indicating no errors
   */
  restoreBorderToNoErrorStatus() {
    this.setState({
      firstname_error_color: "#d0d0d0", //white or red when error
      lastname_error_color: "#d0d0d0",
      email_error_color: "#d0d0d0",
      phone_error_color: "#d0d0d0",
      company_name_error_color: "#d0d0d0",
      industry_error_color: "#d0d0d0",
      password_error_color: "#d0d0d0",
      password_confirm_error_color: "#d0d0d0",
      otp_error_color: "#d0d0d0",
      error_text_reported: `An unexpected error occured, please try again later. Or if it
      persists please refresh this page and give it a try again.`,
    });
  }

  /**
   * Responsible for switching between login and signup forms
   * ? Reset the forms as well
   */
  swicthContextForms() {
    this.setState({
      shouldShowLogin: !this.state.shouldShowLogin,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      company_name: "",
      industry: "",
      password: "",
      password_confirm: "",
      otp: "",
      firstname_error_color: "#d0d0d0", //white or red when error
      lastname_error_color: "#d0d0d0",
      email_error_color: "#d0d0d0",
      phone_error_color: "#d0d0d0",
      company_name_error_color: "#d0d0d0",
      industry_error_color: "#d0d0d0",
      password_error_color: "#d0d0d0",
      password_confirm_error_color: "#d0d0d0",
      isLoading: false, //If it's in a loading state
      hasErrorHappened: false, //If an error happened while loading
      shouldShowSMSAuth: false, //Whether or not to show the SMS checking
      isLoadingResendSMS: false, //Whether the resend sms is working or not.
      error_text_reported: `An unexpected error occured, please try again later. Or if it
      persists please refresh this page and give it a try again.`,
      shouldShowAccountCreated: false, //Whether or not to show when the account is created
      shouldShowChangePhoneNumber: false, //Whether to show the changing phone number window
    });
  }

  /**
   * responsible for make a soft reset on the current page's state
   */
  makeSoftResetOnCurrentState() {
    this.setState({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      company_name: "",
      industry: "",
      password: "",
      password_confirm: "",
      firstname_error_color: "#d0d0d0", //white or red when error
      lastname_error_color: "#d0d0d0",
      email_error_color: "#d0d0d0",
      phone_error_color: "#d0d0d0",
      company_name_error_color: "#d0d0d0",
      industry_error_color: "#d0d0d0",
      password_error_color: "#d0d0d0",
      password_confirm_error_color: "#d0d0d0",
      isLoading: false,
      hasErrorHappened: false, //If an error happened while loading
      shouldShowSMSAuth: false, //Whether or not to show the SMS checking
      isLoadingResendSMS: false, //Whether the resend sms is working or not.
      error_text_reported: `An unexpected error occured, please try again later. Or if it
      persists please refresh this page and give it a try again.`,
      shouldShowAccountCreated: false, //Whether or not to show when the account is created
    });
  }

  /**
   * Responsible to hadle the moving forward after the account is freshly created
   */
  moveForwardAfterFreshSignup() {
    let globalObject = this;
    //Clean forms and activate loader
    this.setState({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      company_name: "",
      industry: "",
      password: "",
      password_confirm: "",
      firstname_error_color: "#d0d0d0", //white or red when error
      lastname_error_color: "#d0d0d0",
      email_error_color: "#d0d0d0",
      phone_error_color: "#d0d0d0",
      company_name_error_color: "#d0d0d0",
      industry_error_color: "#d0d0d0",
      password_error_color: "#d0d0d0",
      password_confirm_error_color: "#d0d0d0",
      isLoading: true, //! ACTIVATE LOADER
      hasErrorHappened: false, //If an error happened while loading
      shouldShowSMSAuth: false, //Whether or not to show the SMS checking
      isLoadingResendSMS: false, //Whether the resend sms is working or not.
      error_text_reported: `An unexpected error occured, please try again later. Or if it
      persists please refresh this page and give it a try again.`,
      shouldShowAccountCreated: false, //Whether or not to show when the account is created
      shouldShowChangePhoneNumber: false, //Whether to show the changing phone number window
    });
    //Show the SMS auth if has all the necessary data, else move back
    setTimeout(function () {
      try {
        if (
          globalObject.props.App.userData.loginData.company_fp !== undefined &&
          globalObject.props.App.userData.loginData.company_fp !== null &&
          globalObject.props.App.userData.loginData.email !== undefined &&
          globalObject.props.App.userData.loginData.email !== null
        ) {
          //Has valid data
          globalObject.resendConfirmationSMSAgain();
          globalObject.setState({
            shouldShowSMSAuth: true,
          });
        } //Invalid data found
        else {
          globalObject.setState({
            isLoading: false,
          });
        }
      } catch (error) {
        console.log(error);
        globalObject.setState({
          isLoading: false,
        });
      }
    }, 2000);
  }

  /**
   * Responsible to resend the confirmation code again.
   */
  resendConfirmationSMSAgain() {
    //!DEBUG
    // this.props.App.userData.loginData = {};
    // this.props.App.userData.loginData.company_fp =
    //   "27f3650a56a80a080d5326783161c2275bd4ea9a98f0b0e8d59f020f491d94cb062d4e827cfdd3397db70673a2d18a9b39696f0761f24ef540f59f059afb669d";
    // this.props.App.userData.loginData.phone = "264856997167";
    //!----

    if (
      this.props.App.userData.loginData !== null &&
      this.props.App.userData.loginData.phone !== undefined &&
      this.props.App.userData.loginData.phone !== null &&
      this.props.App.userData.loginData.company_fp !== undefined
    ) {
      this.setState({ isLoadingResendSMS: true });
      this.SOCKET_CORE.emit("opsOnCorpoDeliveryAccounts_io", {
        op: "resendConfirmationSMS",
        company_fp: this.props.App.userData.loginData.company_fp,
        phone: this.props.App.userData.loginData.phone,
      });
    } //Invalid data found - go back to signup
    else {
      this.swicthContextForms();
    }
  }

  // Renderer callback with condition
  renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return (
        <div
          style={{
            color: "#0e8491",
            fontSize: "15px",
            marginTop: 30,
            cursor: "pointer",
          }}
          onClick={() => this.resendConfirmationSMSAgain()}
        >
          Did not receive it? <strong>Send again</strong>.
        </div>
      );
    } else {
      // Render a countdown
      return (
        <div
          style={{
            color: "#0e8491",
            fontSize: "15px",
            marginTop: 30,
          }}
        >
          <span>
            Resend the code in {minutes > 10 ? minutes : `0${minutes}`}:
            {seconds > 10 ? seconds : `0${seconds}`}
          </span>
        </div>
      );
    }
  };

  /**
   * responsible for validating the otp
   */
  validateOtp() {
    //!DEBUG
    // this.props.App.userData.loginData = {};
    // this.props.App.userData.loginData.company_fp =
    //   "27f3650a56a80a080d5326783161c2275bd4ea9a98f0b0e8d59f020f491d94cb062d4e827cfdd3397db70673a2d18a9b39696f0761f24ef540f59f059afb669d";
    // this.props.App.userData.loginData.phone = "264856997167";
    //!----
    try {
      if (this.state.otp !== undefined && this.state.otp.length > 0) {
        //Not empty
        if (
          this.props.App.userData.loginData !== null &&
          this.props.App.userData.loginData.phone !== undefined &&
          this.props.App.userData.loginData.phone !== null &&
          this.props.App.userData.loginData.company_fp !== undefined
        ) {
          this.setState({ isLoading: true });
          // console.log({
          //   op: "validatePhoneNumber",
          //   otp: this.state.otp,
          //   company_fp: this.props.App.userData.loginData.company_fp,
          //   phone: this.props.App.userData.loginData.phone,
          // });
          this.SOCKET_CORE.emit("opsOnCorpoDeliveryAccounts_io", {
            op: "validatePhoneNumber",
            otp: this.state.otp,
            company_fp: this.props.App.userData.loginData.company_fp,
            phone: this.props.App.userData.loginData.phone,
          });
        } //Invalid account data
        else {
          this.swicthContextForms();
        }
      } //Empty otp field
      else {
        this.setState({ otp_error_color: "red" });
      }
    } catch (error) {
      console.log(error);
      this.swicthContextForms();
    }
  }

  /**
   * responsible for updating the changed phone number if valid
   */
  updatePhoneNumber() {
    try {
      if (
        this.props.App.userData.loginData !== null &&
        this.props.App.userData.loginData.phone !== undefined &&
        this.props.App.userData.loginData.phone !== null &&
        this.props.App.userData.loginData.company_fp !== undefined
      ) {
        if (isValidPhoneNumber(this.state.phone)) {
          //Valid phone
          this.setState({ isLoading: true });
          this.SOCKET_CORE.emit("opsOnCorpoDeliveryAccounts_io", {
            op: "updatePhoneNumber",
            company_fp: this.props.App.userData.loginData.company_fp,
            phone: this.state.phone,
          });
        } //Invalid phone
        else {
          this.setState({ phone_error_color: "red" });
        }
      } //Invalid account data
      else {
        this.swicthContextForms();
      }
    } catch (error) {
      console.log(error);
      this.swicthContextForms();
    }
  }

  render() {
    return (
      <div style={{ backgroundColor: "#fff" }}>
        <Header />
        <div className={classes.headerContainerSecond}>
          <div className={classes.headerTitleContainer}>
            Discover a new way of delivering
          </div>
          <div
            className={classes.formContainer}
            style={{
              height:
                this.state.shouldShowLogin ||
                this.state.isLoading ||
                this.state.hasErrorHappened ||
                this.state.shouldShowSMSAuth
                  ? 500
                  : 690,
            }}
          >
            {this.state.shouldShowChangePhoneNumber &&
            this.state.hasErrorHappened === false ? (
              <div className={classes.signupForm}>
                <div className={classes.mainTitle}>
                  <div>Change your phone number</div>
                </div>
                <PhoneInput
                  defaultCountry="NA"
                  international
                  withCountryCallingCode
                  countryCallingCodeEditable={false}
                  placeholder="Enter phone number"
                  value={this.state.phone}
                  onChange={(value) => this.setState({ phone: value })}
                  className={classes.formBasicInput}
                  autocomplete="new-password"
                  style={{ borderColor: this.state.phone_error_color }}
                />
                <br />
                <div className={classes.termsReview}>
                  You will be <strong>receiving SMS</strong> from us only
                  related to the activities from your account.
                </div>
                <input
                  type="submit"
                  value="Update phone number"
                  onClick={() => this.updatePhoneNumber()}
                  className={classes.formBasicSubmitBttn}
                />
                <br />
                <div
                  className={classes.backButtonOnFail}
                  onClick={() => {
                    this.setState({ shouldShowChangePhoneNumber: false });
                  }}
                >
                  <AiOutlineLeft /> Back
                </div>
              </div>
            ) : this.state.shouldShowAccountCreated &&
              this.state.hasErrorHappened === false ? (
              <div className={classes.errorContainer}>
                <div>
                  <AiFillShop
                    style={{ width: 55, height: 55, color: "#0e8491" }}
                  />
                </div>
                <div className={classes.textWarning}>
                  You account has been successfully created!
                  <br />
                  Click on "Next" to complete the verifications steps.
                </div>
                <div
                  className={classes.backButtonOnFail}
                  onClick={() => this.moveForwardAfterFreshSignup()}
                >
                  Next <AiOutlineRight />
                </div>
              </div>
            ) : this.state.shouldShowSMSAuth &&
              this.state.hasErrorHappened === false ? (
              <div className={classes.signupForm}>
                <div className={classes.mainTitle}>
                  <div>Confirm your phone number</div>
                </div>
                <input
                  type="text"
                  placeholder="Enter the 6-digits code"
                  value={this.state.otp}
                  onChange={(event) =>
                    this.setState({ otp: event.target.value })
                  }
                  onFocus={() => this.setState({ otp_error_color: "#d0d0d0" })}
                  style={{ borderColor: this.state.otp_error_color }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                  maxLength={6}
                />
                <br />
                <div className={classes.termsReview}>
                  Please fill in the <strong>6-digits code</strong> sent to your
                  phone number at{" "}
                  <strong>
                    {this.props.App.userData.loginData !== null
                      ? this.props.App.userData.loginData.phone
                      : null}
                  </strong>
                  .{" "}
                </div>
                {this.state.isLoadingResendSMS ? (
                  <div style={{ marginTop: 15 }}>
                    <Loader
                      type="TailSpin"
                      color="#000"
                      height={20}
                      width={20}
                      timeout={300000000} //3 secs
                    />
                  </div>
                ) : (
                  <Countdown
                    date={Date.now() + 75000}
                    renderer={this.renderer}
                  />
                )}
                <input
                  type="submit"
                  value="Next"
                  onClick={() => this.validateOtp()}
                  className={classes.formBasicSubmitBttn}
                />
                <br />
                <div
                  className={classes.termsReview}
                  style={{
                    color: "#0e8491",
                    fontSize: "15px",
                    marginTop: 30,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    this.setState({ shouldShowChangePhoneNumber: true })
                  }
                >
                  Wrong number?
                </div>
              </div>
            ) : this.state.shouldShowLogin === false &&
              this.state.isLoading === false &&
              this.state.hasErrorHappened === false ? (
              <div className={classes.signupForm}>
                <div className={classes.mainTitle}>
                  <div>Signup</div>
                  <div
                    className={classes.loginSignupOption}
                    onClick={() => this.swicthContextForms()}
                  >
                    or Log in
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="First name"
                    value={this.state.firstname}
                    onChange={(event) =>
                      this.setState({ firstname: event.target.value })
                    }
                    onFocus={() =>
                      this.setState({ firstname_error_color: "#d0d0d0" })
                    }
                    className={classes.formBasicInput}
                    style={{
                      width: 157,
                      marginRight: "10px",
                      borderColor: this.state.firstname_error_color,
                    }}
                    spellCheck={false}
                    autocomplete="new-password"
                    autoCapitalize="false"
                    autoCorrect="false"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={this.state.lastname}
                    onChange={(event) =>
                      this.setState({ lastname: event.target.value })
                    }
                    onFocus={() =>
                      this.setState({ lastname_error_color: "#d0d0d0" })
                    }
                    className={classes.formBasicInput}
                    style={{
                      width: 136,
                      borderColor: this.state.lastname_error_color,
                    }}
                    spellCheck={false}
                    autocomplete="new-password"
                    autoCapitalize="false"
                    autoCorrect="false"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ email_error_color: "#d0d0d0" })
                  }
                  style={{ borderColor: this.state.email_error_color }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <PhoneInput
                  defaultCountry="NA"
                  international
                  withCountryCallingCode
                  countryCallingCodeEditable={false}
                  placeholder="Enter phone number"
                  value={this.state.phone}
                  onChange={(value) => this.setState({ phone: value })}
                  className={classes.formBasicInput}
                  autocomplete="new-password"
                  style={{ borderColor: this.state.phone_error_color }}
                />
                <br />
                <input
                  type="text"
                  placeholder="Company name"
                  value={this.state.company_name}
                  onChange={(event) =>
                    this.setState({ company_name: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ company_name_error_color: "#d0d0d0" })
                  }
                  style={{ borderColor: this.state.company_name_error_color }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <select
                  className={classes.formBasicInput}
                  style={{
                    width: "99.3%",
                    borderColor: this.state.industry_error_color,
                  }}
                  onChange={(event) =>
                    this.setState({ industry: event.target.value })
                  }
                >
                  {Industries.map((el) => {
                    return <option value={el.name}>{el.name}</option>;
                  })}
                </select>
                <br />
                <input
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={(event) =>
                    this.setState({ password: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ password_error_color: "#d0d0d0" })
                  }
                  style={{ borderColor: this.state.password_error_color }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={this.state.password_confirm}
                  onChange={(event) =>
                    this.setState({ password_confirm: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ password_confirm_error_color: "#d0d0d0" })
                  }
                  style={{
                    borderColor: this.state.password_confirm_error_color,
                  }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <div className={classes.termsReview}>
                  By clicking on "<strong>Create your account</strong>" you
                  agree that you have read and understood our terms & conditions
                  and also reviewed our privacy statement.
                  <br />
                  You also agree to <strong>opt-in to receive SMS</strong> from
                  us only related to the activities from this account.
                </div>
                <input
                  type="submit"
                  value="Create your account"
                  onClick={() => this.executeProperStateAction()}
                  className={classes.formBasicSubmitBttn}
                />
              </div>
            ) : this.state.shouldShowLogin &&
              this.state.isLoading === false &&
              this.state.hasErrorHappened === false ? (
              <div className={classes.signupForm}>
                <div className={classes.mainTitle}>
                  <div>Log in</div>
                  <div
                    className={classes.loginSignupOption}
                    onClick={() => this.swicthContextForms()}
                  >
                    or Signup
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ email_error_color: "#d0d0d0" })
                  }
                  style={{ borderColor: this.state.email_error_color }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <input
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={(event) =>
                    this.setState({ password: event.target.value })
                  }
                  onFocus={() =>
                    this.setState({ password_error_color: "#d0d0d0" })
                  }
                  style={{ borderColor: this.state.password }}
                  className={classes.formBasicInput}
                  spellCheck={false}
                  autocomplete="new-password"
                  autoCapitalize="false"
                  autoCorrect="false"
                />
                <br />
                <div className={classes.termsReview}>
                  You will be <strong>receiving SMS</strong> from us only
                  related to the activities from your account.
                </div>
                <input
                  type="submit"
                  value="Log in to your account"
                  onClick={() => this.executeProperStateAction()}
                  className={classes.formBasicSubmitBttn}
                />
              </div>
            ) : this.state.isLoading === true ? (
              <div className={classes.errorContainer}>
                <div>
                  <Loader
                    type="TailSpin"
                    color="#000"
                    height={50}
                    width={50}
                    timeout={300000000} //3 secs
                  />
                </div>
                <div className={classes.textLoading}>Give us a sec...</div>
              </div>
            ) : this.state.hasErrorHappened ? (
              <div className={classes.errorContainer}>
                <div>
                  <AiTwotoneSafetyCertificate
                    style={{ width: 55, height: 55, color: "#b22222" }}
                  />
                </div>
                <div className={classes.textWarning}>
                  {this.state.error_text_reported}
                </div>
                <div
                  className={classes.backButtonOnFail}
                  onClick={() =>
                    this.state.shouldShowSMSAuth === false
                      ? this.swicthContextForms()
                      : this.setState({ hasErrorHappened: false, otp: "" })
                  }
                >
                  <AiOutlineLeft /> Back
                </div>
              </div>
            ) : (
              <div>neutral state</div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={classes.bodyContainer}>
          <div className={classes.mainTitleBody}>On demand delivery</div>
          <div className={classes.optionsMaiNContainer}>
            <div className={classes.optionNode}>
              <div className={classes.imageOptionInsider}>
                <img
                  alt="img"
                  src={savingMoney}
                  className={classes.imageAspectGeneric}
                />
              </div>
              <div className={classes.titleInsideOption}>Flexible pricing</div>
              <div className={classes.descriptionInsideOption}>
                Get realistic prices based on your location and type of
                packages.
              </div>
            </div>
            {/* 2 */}
            <div className={classes.optionNode}>
              <div className={classes.imageOptionInsider}>
                <img
                  alt="img"
                  src={workflow}
                  className={classes.imageAspectGeneric}
                />
              </div>
              <div className={classes.titleInsideOption}>Request anytime</div>
              <div className={classes.descriptionInsideOption}>
                Make as many delivery request as your business need to handle
                all your logistical needs in once go and in one place.
              </div>
            </div>
            {/* 3 */}
            <div className={classes.optionNode}>
              <div className={classes.imageOptionInsider}>
                <img
                  alt="img"
                  src={analysis}
                  className={classes.imageAspectGeneric}
                />
              </div>
              <div className={classes.titleInsideOption}>Keep track</div>
              <div className={classes.descriptionInsideOption}>
                Get detailed analytics about your deliveries to help you
                understand you pick times and many more.
              </div>
            </div>
          </div>
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Home);
