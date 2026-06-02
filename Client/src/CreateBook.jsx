import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateBook = () => {

  // state
  const [values, setValues] = useState({
    publisher: "",
    name: "",
    edition: "",
    date: "",
    cost: ""
  })

  const navigate = useNavigate()

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token")

    // 🔒 If no token → go login
    if (!token) {
      navigate("/login")
      return
    }

    axios.post('http://localhost:5000/books', values, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        navigate("/") // ✅ go back to list
      })
      .catch((err) => {
        console.log(err)

        // 🔒 If token invalid → logout
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
        }
      })
  }

  return (
    <div className="d-flex align-items-center flex-column mt-3">
      <h2>Add a Book</h2>

      <form className="w-50" onSubmit={handleSubmit}>

        {/* Publisher */}
        <div className="mb-3">
          <label className="form-label">Publisher</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter publisher name"
            value={values.publisher}
            onChange={(e) =>
              setValues({ ...values, publisher: e.target.value })
            }
            required
          />
        </div>

        {/* Book Name */}
        <div className="mb-3">
          <label className="form-label">Book Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter book name"
            value={values.name}
            onChange={(e) =>
              setValues({ ...values, name: e.target.value })
            }
            required
          />
        </div>

        {/* Edition */}
        <div className="mb-3">
          <label className="form-label">Edition</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 2nd edition"
            value={values.edition}
            onChange={(e) =>
              setValues({ ...values, edition: e.target.value })
            }
          />
        </div>

        {/* Publish Date */}
        <div className="mb-3">
          <label className="form-label">Publish Date</label>
          <input
            type="date"
            className="form-control"
            value={values.date}
            onChange={(e) =>
              setValues({ ...values, date: e.target.value })
            }
            required
          />
        </div>

        {/* Cost */}
        <div className="mb-3">
          <label className="form-label">Cost</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter cost"
            value={values.cost}
            onChange={(e) =>
              setValues({ ...values, cost: e.target.value })
            }
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>

      </form>
    </div>
  )
}

export default CreateBook