import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Login() {
  const [values, setValues] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://localhost:5000/login", values)
      .then(res => {
        // ✅ store token
        localStorage.setItem("token", res.data.token);

        // ✅ go to books page
        navigate("/");
      })
      .catch(err => {
        console.log(err);
        alert("Login failed");
      });
  };

  return (
    <div className="d-flex align-items-center flex-column mt-5">
      <h2>Login</h2>

      <form className="w-25" onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Username"
            className="form-control"
            value={values.username}
            onChange={(e) =>
              setValues({ ...values, username: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            className="form-control"
            value={values.password}
            onChange={(e) =>
              setValues({ ...values, password: e.target.value })
            }
            required
          />
        </div>

        <button className="btn btn-primary w-100">Login</button>
      </form>
      <p className="mt-3">
  Don't have an account? <Link to="/register">Register</Link>
</p>
    </div>
  );
}