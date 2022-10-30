import React from "react";
import { Link } from "react-router-dom";

const Public = () => {
  const content = (
    <section className="public">
      <header>
        <h1>
          Welcome to <span className="nowrap">Cell Point</span>
        </h1>
      </header>
      <main className="public__main">
        <p>
          Located in Beautiful town of Kullu City, Cell Point provides a trained
          staff ready to meet your tech repair needs.
        </p>
        <address className="public__addr">
          Cell Point Repairs
          <br />
          Himachal Pradesh
          <br />
          Kullu, 175101
          <br />
          <a href="tel:+915555555555">(+91) 55555-55555</a>
        </address>
        <br />
        <p>Owner: Akshit Thakur</p>
      </main>
      <footer>
        <Link to="/login">Employee Login</Link>
      </footer>
    </section>
  );
  return content;
};

export default Public;
