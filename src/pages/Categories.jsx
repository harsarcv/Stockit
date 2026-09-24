import { useEffect, useState } from 'react'

function Categories() {
    const [categories, setCategories] = useState([])
    const [nama, setNama] = useState('')
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        fetch('http://localhost:3000/categories')
            .then(response => response.json())
            .then(data => {
                setCategories(data)
            })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch('http://localhost:3000/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama
            })
        })

        const data = await response.json()

        console.log(data)

        setNama('')

        const updatedResponse = await fetch('http://localhost:3000/categories')
        const updatedData = await updatedResponse.json()

        setCategories(updatedData)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        const response = await fetch(`http://localhost:3000/categories/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama
            })
        })

        const data = await response.json()

        console.log(data)

        setEditId(null)
        setNama('')

        const updatedResponse = await fetch('http://localhost:3000/categories')
        const updatedData = await updatedResponse.json()

        setCategories(updatedData)
    }

    const handleDelete = async (id) => {
        const response = await fetch(`http://localhost:3000/categories/${id}`, {
            method: 'DELETE'
        })

        const data = await response.json()

        console.log(data)

        const updatedResponse = await fetch('http://localhost:3000/categories')
        const updatedData = await updatedResponse.json()

        setCategories(updatedData)
    }

    return (
        <div className="categories-page">

            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p>Manage and organize your product categories</p>
                </div>
            </div>

            <div className="category-form-card">

                <div className="category-form-header">
                    <div>
                        <h2>
                            {editId ? 'Edit Category' : 'Add New Category'}
                        </h2>

                        <p>
                            {editId
                                ? 'Update the category information'
                                : 'Create a category to organize your products'}
                        </p>
                    </div>
                </div>

                <form onSubmit={editId ? handleUpdate : handleSubmit}>

                    <div className="category-form-row">

                        <div className="form-group">
                            <label>Category Name</label>

                            <input
                                type="text"
                                placeholder="Enter category name"
                                value={nama}
                                onChange={e => setNama(e.target.value)}
                            />
                        </div>

                        <div className="category-form-actions">

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                {editId ? 'Save Changes' : 'Add Category'}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        setEditId(null)
                                        setNama('')
                                    }}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </div>

                </form>

            </div>


            <div className="category-list-header">

                <div>
                    <h2>Categories</h2>
                    <p>{categories.length} categories</p>
                </div>

            </div>


            <div className="category-table-card">

                <table className="category-table">

                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Category</th>
                            <th>ID</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    <div className="table-empty">
                                        No categories found.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            categories.map((category, index) => (
                                <tr key={category.id}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        <strong className="category-name">
                                            {category.nama}
                                        </strong>
                                    </td>

                                    <td>
                                        <span className="category-id">
                                            #{category.id}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="table-actions">

                                            <button
                                                type="button"
                                                className="edit-button"
                                                onClick={() => {
                                                    setEditId(category.id)
                                                    setNama(category.nama)
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>

                                </tr>

                            ))
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    )
}

export default Categories