// components/SectionDivider.jsx

import React from "react";

const SectionDivider = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.line} />

      <div style={styles.icon}>
        ✦
      </div>

      <div style={styles.line} />
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    margin: "70px 0",
    width: "100%",
  },

  line: {
    flex: 1,
    height: "2px",
    maxWidth: "100%",
    backgroundColor: "#D4AF37", // gold
    opacity: 0.8,
    borderRadius: "2px",
  },

  icon: {
    fontSize: "18px",
    color: "#D4AF37",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
};

export default SectionDivider;