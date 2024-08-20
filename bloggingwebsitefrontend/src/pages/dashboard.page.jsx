import React from "react";
import "../pages/dashboard.css";
import logo from "../imgs/logo.png";
import { Link } from "react-router-dom";

const DashBoard = () => {
  return (
    <>
      <div class="grid-container">
        <div class="grid-item1">
          <Link to="/">
            <i class="fi fi-sr-arrow-circle-left"></i>
          </Link>
          <img
            src={logo}
            className="w-full h-full"
            style={{ height: 50 + "px", width: 200 + "px" }}
          />
          <br />
          <hr />
          <br />
          <div className="link1">
            <Link className="font-bold tex-xl text-left ">
              <i class="fi fi-sr-home"></i> Dashboard
            </Link>
          </div>
          <div className="link1">
            <Link className=" font-bold text-xl">
              <i class="fi fi-sr-pen-nib"></i> Blog
            </Link>
            <br />
          </div>
          <div className="link2">
            <Link className=" font-bold text-xl">
              <i class="fi fi-sr-circle-user"></i> User
            </Link>
          </div>
        </div>
        <div class="grid-item2">
          <div class="topnav">
            <a class="active" href="#home">
              Overview
            </a>
            <div class="search-container">
              <form action="/action_page.php">
                <input type="text" placeholder="Search.." name="search" />
                <button type="submit">
                  <i class="fi fi-br-search"></i>
                </button>
              </form>
            </div>
          </div>
          <br />
          <button className="btn-add btn-dark">
            <i class="fi fi-sr-add"></i> Add
          </button>
          <div>
            <table>
              <tr>
                <th>Name Blog</th>
                <th>User</th>
                <th>Action</th>
              </tr>
              <tr>
                <td>Cá kho Vũ Đại</td>
                <td>daotranthuyan</td>
                <td>
                  <button className="text-xl"><i class="fi fi-sr-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Cháo lươn Nghệ An</td>
                <td>Alexa</td>
                <td>
                  <button className="text-xl"><i class="fi fi-sr-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Nem cua bể</td>
                <td>daotranthuyan</td>
                <td>
                  <button className="text-xl"><i class="fi fi-sr-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Bún bò huế</td>
                <td>Charlotte</td>
                <td>
                  <button className="text-xl"><i class="fi fi-sr-trash"></i></button>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
