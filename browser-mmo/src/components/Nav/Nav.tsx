import React from "react";
import placeholder from "/src/assets/placeholder.png";
import styles from "./Nav.module.css";

export const Nav = () => {
  return (
    <nav>
      <div className={styles.logo}>
        <img src={placeholder} alt="" />
        <h1>Website</h1>
      </div>
      <div className={styles.buttons}>
        <button className="active-button button">Home</button>
        <button className="button">Sign In</button>
        <button className="button">Sign Up</button>
      </div>
    </nav>
  );
};
