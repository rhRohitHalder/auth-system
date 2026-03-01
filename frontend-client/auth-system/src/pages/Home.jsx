import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-4xl text-white font-bold">
        Welcome to the Home Page
      </h1>
      <Link to="/register">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
          Go to Registration
        </button>
      </Link>
    </div>
  );
};

export default Home;
