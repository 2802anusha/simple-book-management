import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const UpdateBook = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 🔒 redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

  // ⚠️ protect if user opens /update directly
  const { book } = location.state || {}

  useEffect(() => {
    if (!book) {
      navigate("/")
    }
  }, [book, navigate])

  const [values, setValues] = useState({
    publisher: book?.publisher || "",
    name: book?.name || "",
    edition: book?.edition || "",
    date: book?.date ? book.date.split("T")[0] : "",
    cost: book?.cost || ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token")

    axios.put(
      `http://localhost:5000/update/${book.id}`,
      values,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(() => {
        // ✅ force fresh load of Books page
        navigate("/", { replace: true })
      })
      .catch(err => {
        console.log(err)
        if (err.response?.status === 401) {
          navigate("/login")
        }
      })
  }

  return (
    <div className="d-flex align-items-center flex-column mt-3">
      <h2>Update Book</h2>

      <form className="w-50" onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          value={values.publisher}
          onChange={e =>
            setValues({ ...values, publisher: e.target.value })
          }
          placeholder="Publisher"
          required
        />

        <input
          className="form-control mb-2"
          value={values.name}
          onChange={e =>
            setValues({ ...values, name: e.target.value })
          }
          placeholder="Book Name"
          required
        />

        <input
          className="form-control mb-2"
          value={values.edition}
          onChange={e =>
            setValues({ ...values, edition: e.target.value })
          }
          placeholder="Edition"
        />

        <input
          type="date"
          className="form-control mb-2"
          value={values.date}
          onChange={e =>
            setValues({ ...values, date: e.target.value })
          }
          required
        />

        <input
          type="number"
          className="form-control mb-2"
          value={values.cost}
          onChange={e =>
            setValues({ ...values, cost: e.target.value })
          }
          required
        />

        <button className="btn btn-primary">Update</button>
      </form>
    </div>
  )
}

export default UpdateBook