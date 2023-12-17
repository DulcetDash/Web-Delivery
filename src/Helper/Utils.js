import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export const calculateDiffPercentage = (obj1, obj2) => {
  let diffPercentages = {};

  const calculateDiff = (path, value1, value2) => {
    if (
      typeof value1 === "number" &&
      typeof value2 === "number" &&
      value1 !== 0
    ) {
      // Compute the percentage difference for numeric values
      diffPercentages[path] = ((value2 - value1) / Math.abs(value1)) * 100;
    } else if (typeof value1 === "object" && typeof value2 === "object") {
      // Recursive call for nested objects
      for (let key in value1) {
        calculateDiff(path ? `${path}.${key}` : key, value1[key], value2[key]);
      }
    }
  };

  calculateDiff("", obj1, obj2);

  return diffPercentages;
};

export function beautifyHtml(html, indentSize = 2) {
  let indent = 0;
  const tokens = html.split(/(<(?:\/?[a-zA-Z]+).*?>)/g).filter(Boolean);
  const indents = [""];

  for (let i = 1; i < 100; i++) {
    indents.push(indents[i - 1] + " ".repeat(indentSize));
  }

  const formattedHtml = tokens
    .map((token) => {
      if (/^<\/.*?>$/.test(token)) {
        indent--;
      }

      let line = indents[indent] + token;

      if (/^<[^/].*?>$/.test(token) && !/^<.*?\/>$/.test(token)) {
        indent++;
      }

      return line;
    })
    .join("\n");

  return formattedHtml;
}

export const roundToTwo = (num) => {
  return +(Math.round(num + "e+2") + "e-2");
};

export const getPercentageUsed = (profileData) => {
  if (!profileData?.balance) return 0;

  const { credits, usedCredits } = profileData?.balance;

  return {
    used: roundToTwo((credits * 100) / (credits + usedCredits)),
    notUsed: roundToTwo((credits * 100) / (credits + usedCredits)),
  };
};

/**
 * Capitalize the given string.
 *
 * @param {string} str - The string to capitalize.
 * @param {boolean} everyWord - If true, capitalize every word, otherwise only the first letter of the entire string.
 * @returns {string} - The capitalized string.
 */
export const capitalize = (str, everyWord = false) => {
  if (!str || typeof str !== "string") {
    return "";
  }

  if (everyWord) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
};

export const getUserProfile = async (
  profileData,
  dispatch,
  updateLoginData
) => {
  try {
    const getProfile = await axios.get(
      `${process.env.REACT_APP_BACKEND}/api/v1/profile`,
      {
        headers: {
          Authorization: `Bearer ${profileData?.token}`,
        },
        withCredentials: true,
      }
    );
    if (getProfile?.data?.status === "success") {
      dispatch(updateLoginData(getProfile?.data?.data));
    } else if (getProfile?.status === 401) {
      dispatch(updateLoginData({}));
      window.location.href = "/login";
    } else {
      toast.error("Failed to load your profile.");
    }
  } catch (error) {
    console.log(error);
    if (error?.response?.status === 401) {
      window.location.href = "/login";
      dispatch(updateLoginData({}));
    }
  }
};

export const formatBillingDetails = (obj) => {
  // Parse dates using dayjs
  const startDate = dayjs(obj.createAt);
  const endDate = dayjs(obj.expirationDate);

  // Format dates using dayjs
  const formattedStartDate = startDate.format("MMM D, YYYY");
  const formattedEndDate = endDate.format("MMM D, YYYY");

  // Return formatted details
  return {
    billing_period: `From ${formattedStartDate} - To ${formattedEndDate}`,
    reset_date: `Credits resets on ${formattedEndDate}`,
  };
};

export const formatDateGeneric = (date) => {
  return dayjs(date).format("MMM D, YYYY hh:mm A");
};

export const ellipseStringAt = (string, length) => {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  } else {
    return string;
  }
};
