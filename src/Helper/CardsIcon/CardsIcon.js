import React from "react";
import alipay from "./assets/alipay.svg";
import amex from "./assets/amex.svg";
import codeFront from "./assets/code-front.svg";
import code from "./assets/code.svg";
import diners from "./assets/diners.svg";
import discover from "./assets/discover.svg";
import elo from "./assets/elo.svg";
import generic from "./assets/generic.svg";
import hiper from "./assets/hiper.svg";
import hipercard from "./assets/hipercard.svg";
import jcb from "./assets/jcb.svg";
import maestro from "./assets/maestro.svg";
import mastercard from "./assets/mastercard.svg";
import mir from "./assets/mir.svg";
import paypal from "./assets/paypal.svg";
import unionpay from "./assets/unionpay.svg";
import visa from "./assets/visa.svg";

const CardsIcon = ({ cardName, ...props }) => {
  const name = cardName.toLowerCase().trim();

  const cardImages = {
    alipay,
    amex,
    codefront: codeFront,
    code,
    diners,
    discover,
    elo,
    generic,
    hiper,
    hipercard,
    jcb,
    maestro,
    mastercard,
    mir,
    paypal,
    unionpay,
    visa,
  };

  if (!cardImages[name]) {
    return <img {...props} src={cardImages["generic"]} alt={"generic"} />;
  }

  return <img {...props} src={cardImages[name]} alt={name} />;
};

export default CardsIcon;
