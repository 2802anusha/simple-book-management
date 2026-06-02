import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'

const Books = () => {

  // ✅ state
  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ fetch books function
  const fetchBooks = () => {
    const token = localStorage.getItem("token")

    // 🔒 If no token → login
    if (!token) {
      navigate("/login")
      return
    }

    axios.get("http://localhost:5000/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setBooks(res.data))
      .catch(err => {
        console.log(err)
        localStorage.removeItem("token")
        navigate("/login")
      })
  }

  // ✅ Step 3 — FIXED useEffect (VERY IMPORTANT)
  useEffect(() => {
    fetchBooks()
  }, [location.pathname])

  // ✅ Update navigation
  const handleUpdate = (book) => {
    navigate('/update', { state: { book } })
  }

  // ✅ Delete book
  const handleDelete = (id) => {
    const token = localStorage.getItem("token")

    axios.delete(`http://localhost:5000/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        setBooks(prev => prev.filter(book => book.id !== id))
      })
      .catch(err => console.log(err))
  }

  // ✅ Safe filter
  const filteredBooks = books.filter(book =>
    book.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mt-4">

      <h2 className="text-center mb-4">Book Management System</h2>

      <div className="d-flex justify-content-between mb-3">
        <Link to="/create" className="btn btn-success">
          Add Book
        </Link>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by book name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBooks.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Publisher</th>
              <th>Book Name</th>
              <th>Edition</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooks.map(book => (
              <tr key={book.id}>
                <td>{book.publisher}</td>
                <td>{book.name}</td>
                <td>{book.edition}</td>
                <td>{book.date?.split("T")[0]}</td>
                <td>{book.cost}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdate(book)}
                  >
                    Update
                  </button>

                  <button
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="text-center">No records found</h4>
      )}
    </div>
  )
}

export default Books