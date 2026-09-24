import { useEffect, useState } from 'react'

function Suppliers() {
    const [suppliers, setSuppliers] = useState([])
    const [nama, setNama] = useState('')
    const [kontak, setKontak] = useState('')
    const [email, setEmail] = useState('')
    const [alamat, setAlamat] = useState('')
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        fetch('http://localhost:3000/suppliers')
            .then(response => response.json())
            .then(data => {
                setSuppliers(data)
            })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await fetch('http://localhost:3000/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama,
                kontak,
                email,
                alamat
            })
        })

        const data = await response.json()

        console.log(data)

        setNama('')
        setKontak('')
        setEmail('')
        setAlamat('')

        const updatedResponse = await fetch('http://localhost:3000/suppliers')
        const updatedData = await updatedResponse.json()

        setSuppliers(updatedData)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        const response = await fetch(`http://localhost:3000/suppliers/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama,
                kontak,
                email,
                alamat
            })
        })

        const data = await response.json()

        console.log(data)

        setEditId(null)
        setNama('')
        setKontak('')
        setEmail('')
        setAlamat('')

        const updatedResponse = await fetch('http://localhost:3000/suppliers')
        const updatedData = await updatedResponse.json()

        setSuppliers(updatedData)
    }

    const handleDelete = async (id) => {
        const response = await fetch(`http://localhost:3000/suppliers/${id}`, {
            method: 'DELETE'
        })

        const data = await response.json()

        console.log(data)

        const updatedResponse = await fetch('http://localhost:3000/suppliers')
        const updatedData = await updatedResponse.json()

        setSuppliers(updatedData)
    }

    return (
        <div className="suppliers-page">

            <div className="page-header">
                <div>
                    <h1>Suppliers</h1>
                    <p>Manage supplier information for your inventory</p>
                </div>
            </div>


            <div className="supplier-form-card">

                <div className="supplier-form-header">
                    <div>
                        <h2>
                            {editId ? 'Edit Supplier' : 'Add New Supplier'}
                        </h2>

                        <p>
                            {editId
                                ? 'Update the supplier information'
                                : 'Add a new supplier to your inventory'}
                        </p>
                    </div>
                </div>


                <form onSubmit={editId ? handleUpdate : handleSubmit}>

                    <div className="supplier-form-grid">

                        <div className="form-group">
                            <label>Supplier Name</label>

                            <input
                                type="text"
                                placeholder="Enter supplier name"
                                value={nama}
                                onChange={e => setNama(e.target.value)}
                            />
                        </div>


                        <div className="form-group">
                            <label>Contact</label>

                            <input
                                type="text"
                                placeholder="Enter contact number"
                                value={kontak}
                                onChange={e => setKontak(e.target.value)}
                            />
                        </div>


                        <div className="form-group">
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter supplier email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>


                        <div className="form-group supplier-address">
                            <label>Address</label>

                            <textarea
                                placeholder="Enter supplier address"
                                value={alamat}
                                onChange={e => setAlamat(e.target.value)}
                                rows="3"
                            />
                        </div>

                    </div>


                    <div className="supplier-form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            {editId ? 'Save Changes' : 'Add Supplier'}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                    setEditId(null)
                                    setNama('')
                                    setKontak('')
                                    setEmail('')
                                    setAlamat('')
                                }}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </div>


            <div className="supplier-list-header">

                <div>
                    <h2>Suppliers</h2>
                    <p>{suppliers.length} suppliers</p>
                </div>

            </div>


            <div className="supplier-table-card">

                <div className="supplier-table-wrapper">

                    <table className="supplier-table">

                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Supplier</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="table-empty">
                                            No suppliers found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier, index) => (

                                    <tr key={supplier.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="supplier-name-cell">
                                                <strong>
                                                    {supplier.nama}
                                                </strong>

                                                <span>
                                                    Supplier ID: #{supplier.id}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {supplier.kontak || '-'}
                                        </td>

                                        <td>
                                            {supplier.email || '-'}
                                        </td>

                                        <td>
                                            <span className="supplier-address-cell">
                                                {supplier.alamat || '-'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="table-actions">

                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() => {
                                                        setEditId(supplier.id)
                                                        setNama(supplier.nama)
                                                        setKontak(supplier.kontak)
                                                        setEmail(supplier.email)
                                                        setAlamat(supplier.alamat)
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() => handleDelete(supplier.id)}
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

        </div>
    )
}

export default Suppliers