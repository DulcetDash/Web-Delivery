import { MdCheck } from "react-icons/md";
import {
  BUSINESS_COLOR,
  FREELANCE_COLOR,
  GREEN,
  STARTUP_COLOR,
} from "../Colors";

const dollarToCreditRate = 8600;

export const dollarsToCredits = (dollars) => {
  return dollarToCreditRate * dollars;
};

export const creditsToDollars = (credits) => {
  return Math.round(credits / dollarToCreditRate);
};

export const getPlansFeaturesList = () => {
  const checkFeature = () => {
    return <MdCheck style={{ color: GREEN, fontSize: "2em" }} />;
  };

  const features = [
    {
      name: "API credits",
      freelance: "250,000",
      startup: "1,500,000",
      business: "4,000,000",
    },
    {
      name: "Concurrent requests",
      freelance: 15,
      startup: 150,
      business: 250,
    },
    {
      name: "General web scraping",
      freelance: checkFeature(),
      startup: checkFeature(),
      business: checkFeature(),
    },
    {
      name: "Data extraction",
      freelance: checkFeature(),
      startup: checkFeature(),
      business: checkFeature(),
    },
    {
      name: "Content monitoring",
      freelance: <></>,
      startup: checkFeature(),
      business: checkFeature(),
    },
    {
      name: "Screenshots",
      freelance: checkFeature(),
      startup: checkFeature(),
      business: checkFeature(),
    },
    {
      name: "Priority email support",
      freelance: <></>,
      startup: checkFeature(),
      business: checkFeature(),
    },
  ];

  return features;
};

export const getPlansList = () => {
  const plans = [
    {
      name: "Freelance",
      price: 29,
      color: FREELANCE_COLOR,
    },
    {
      name: "Startup",
      price: 99,
      color: STARTUP_COLOR,
    },
    {
      name: "Business",
      price: 259,
      color: BUSINESS_COLOR,
    },
  ];

  return plans;
};

export const parseNumbers = (number) => {
  return `${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
