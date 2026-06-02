import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [values, setValues] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://localhost:5000/register", values)
      .then(() => {
        alert("Registration Successful");
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        alert("Registration Failed");
      });
  };

  return (
    <div className="d-flex align-items-center flex-column mt-5">
      <h2>Register</h2>

      <form className="w-25" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Username"
          value={values.username}
          onChange={(e) =>
            setValues({ ...values, username: e.target.value })
          }
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={values.password}
          onChange={(e) =>
            setValues({ ...values, password: e.target.value })
          }
        />

        <button type="submit" className="btn btn-success w-100">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;