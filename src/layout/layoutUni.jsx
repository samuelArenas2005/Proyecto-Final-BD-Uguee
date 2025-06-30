import React from "react";
import NavbarUni from "./headerUni/headerUni";
import Footer from "./footer/footer";
import "./layout.css";

const Layout = ({ children }) => {
  return (
    <>
      <NavbarUni />
      <main className="layout-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
