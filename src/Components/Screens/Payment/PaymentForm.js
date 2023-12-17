import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "antd";
import Loader from "../../../Helper/Loader/Loader";
import { CORAL_RED, GREEN } from "../../../Helper/Colors";
import { MdError } from "react-icons/md";

const PaymentForm = ({
  selectedPriceId,
  // setStep,
  selectedPlan,
  confirmSetupIntent,
  parentState,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    if (confirmSetupIntent) {
      console.log("CONFIRM SETUP INTENT");
      const { error } = await stripe.confirmSetup({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
          //   return_url: `${window.location.origin}/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (for example, payment
        // details incomplete)
        setMessage(error.message);
      } else {
        // Your customer will be redirected to your `return_url`. For some payment
        // methods like iDEAL, your customer will be redirected to an intermediate
        // site first to authorize the payment, then redirected to the `return_url`.
      }
    } else {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          // return_url: `${window.location.origin}/completion`,
        },
        redirect: "if_required",
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occured.");
        }
      } else {
        if (paymentIntent.status === "succeeded") {
          // setStep("completion");
          // setIsLoading(false);
          parentState.setState({
            isPaymentSuccessful: true,
          });
        } else {
          setMessage("An unexpected error occured.");
        }
      }
    }

    setIsLoading(false);
  };

  const isDisabled = () => isLoading || !stripe || !elements;

  return (
    <div
      style={{
        width: 470,
        margin: "auto",
        marginTop: 30,
      }}>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        {/* Show any error or success messages */}
        {message && (
          <div
            id="payment-message"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 20,
              fontSize: "0.9em",
              color: CORAL_RED,
            }}>
            <MdError style={{ marginRight: 10 }} />
            {message}
          </div>
        )}
        <Button
          style={{
            backgroundColor: GREEN,
            borderColor: GREEN,
            width: "100%",
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 25,
            fontWeight: "bold",
            color: "white",
            fontSize: "1.1em",
            opacity: isDisabled() ? 0.5 : 1,
          }}
          disabled={isDisabled()}
          onClick={handleSubmit}
          id="submit">
          {isLoading ? (
            <Loader size={30} color="white" />
          ) : (
            <>
              {`Pay now - $${selectedPlan?.amount}`}
              <span
                style={{
                  fontWeight: "normal",
                  fontSize: "0.8em",
                  marginLeft: 10,
                  position: "relative",
                  bottom: 1,
                }}>
                ({selectedPlan?.planName ?? "Plan"})
              </span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;
