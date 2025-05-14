import React from "react";
import Navbar from "./header/header";
import Footer from "./footer/footer";
import "./layout.css";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="layout-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
