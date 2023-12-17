import { BASIC_RADIUS, DARK_GREEN, LIGHT_GREEN, SECONDARY } from "./Colors";

export const HighlightWord = (text) => {
  return (
    <span
      style={{
        borderBottom: `5px solid ${SECONDARY}`,
        fontWeight: "bold",
      }}>
      {text}
    </span>
  );
};

export const apiRequestLine = ({ url, predicate = "GET" }) => {
  return (
    <pre>
      <code
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#2A2D39",
          color: "#fff",
          flex: 1,
          padding: 10,
          borderRadius: BASIC_RADIUS,
        }}>
        <div
          style={{
            backgroundColor: DARK_GREEN,
            color: LIGHT_GREEN,
            width: 50,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: BASIC_RADIUS,
            marginRight: 15,
          }}>
          {predicate}
        </div>
        <div style={{ fontSize: "0.8em" }}>{url}</div>
      </code>
    </pre>
  );
};

export const addContextedCodeLine = ({ code, context = "CONTEXT" }) => {
  return (
    <pre>
      <code
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#2A2D39",
          color: "#fff",
          flex: 1,
          padding: 10,
          borderRadius: BASIC_RADIUS,
        }}>
        <div
          style={{
            backgroundColor: "#fff",
            color: "#000",
            width: 50,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: BASIC_RADIUS,
            marginRight: 15,
            fontSize: "0.9em",
          }}>
          {context}
        </div>
        <div style={{ fontSize: "0.8em" }}>{code}</div>
      </code>
    </pre>
  );
};
