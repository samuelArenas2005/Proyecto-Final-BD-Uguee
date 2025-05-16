import React from "react";
import Footer from "./footer/footer";
import Navbar from "./headerPasajero/headerPasajero";
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
