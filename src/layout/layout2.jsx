import React from "react";
import Footer from "./footer/footer";
import "./layout.css";

const Layout = ({ children }) => {
  return (
    <>
      <main className="layout-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
