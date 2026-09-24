import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import * as XLSX from 'xlsx'

function Products() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [nama, setNama] = useState('')
    const [harga, setHarga] = useState('')
    const [stok, setStok] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [importFile, setImportFile] = useState(null)
    const [importPreview, setImportPreview] = useState([])

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                nama: 'ASUS Vivobook 14',
                harga: 8000000,
                stok: 10,
                kategori: 'Electronics'
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData)

        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Products'
        )

        XLSX.writeFile(
            workbook,
            'product-import-template.xlsx'
        )
    }

    const handleImportExcel = async () => {

        if (!importFile) {
            alert('Pilih file Excel terlebih dahulu')
            return
        }

        const data = await importFile.arrayBuffer()

        const workbook = XLSX.read(data)

        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const rows = XLSX.utils.sheet_to_json(worksheet)

        const validRows = rows.filter(item =>
            item.nama &&
            item.harga !== undefined &&
            item.stok !== undefined &&
            item.kategori
        )

        if (validRows.length !== rows.length) {
            alert('Ada data Excel yang belum lengkap')
            return
        }

        const invalidType = rows.some(item =>
            isNaN(Number(item.harga)) ||
            isNaN(Number(item.stok))
        )

        if (invalidType) {
            alert('Harga dan stok harus berupa angka')
            return
        }

        const formattedRows = rows.map(item => ({
            nama: item.nama,
            harga: Number(item.harga),
            stok: Number(item.stok),
            kategori: item.kategori
        }))

        const categoryNames = categories.map(category =>
            category.nama.toLowerCase()
        )

        const invalidCategories = formattedRows.filter(item =>
            !categoryNames.includes(item.kategori.toLowerCase())
        )

        if (invalidCategories.length > 0) {
            const names = [
                ...new Set(invalidCategories.map(item => item.kategori))
            ]

            alert(
                `Kategori berikut belum tersedia: ${names.join(', ')}`
            )

            return
        }

        console.log('DATA SIAP IMPORT:', formattedRows)

        setImportPreview(rows)
    }

    const handleConfirmImport = async () => {
        try {
            const response = await fetch('http://localhost:3000/products/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    products: importPreview
                })
            })

            const result = await response.json()

            if (!response.ok) {
                alert(result.message || 'Gagal mengimport produk')
                return
            }

            alert(result.message)

            const updatedProducts = await fetch('http://localhost:3000/products')
            const productsData = await updatedProducts.json()

            setProducts(productsData)
            setImportFile(null)
            setImportPreview([])
        } catch (error) {
            console.error('Error:', error)
            alert('Terjadi kesalahan saat import produk')
        }
    }

    useEffect(() => {
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(data => {
                setProducts(data)
            })
            .catch(error => {
                console.error('Gagal mengambil produk:', error)
            })
    }, [])

    useEffect(() => {
        fetch('http://localhost:3000/categories')
            .then(response => response.json())
            .then(data => {
                setCategories(data)
            })
            .catch(error => {
                console.error('Gagal mengambil kategori:', error)
            })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nama,
                    harga: Number(harga),
                    stok: Number(stok),
                    category_id: Number(categoryId)
                })
            })

            const data = await response.json()

            console.log(data)

            if (!response.ok) {
                alert(data.message || 'Gagal menambahkan produk')
                return
            }

            const updatedProducts = await fetch('http://localhost:3000/products')
            const productsData = await updatedProducts.json()
            console.log('Produk setelah update:', productsData)

            setProducts(productsData)

            setEditId(null)
            setNama('')
            setHarga('')
            setStok('')
            setCategoryId('')

        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDelete = async (id) => {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE'
        })

        const data = await response.json()

        console.log(data)

        setProducts(products.filter(product => product.id !== id))
    }

    const handleEdit = (product) => {
        setEditId(product.id)
        setNama(product.nama)
        setHarga(product.harga)
        setStok(product.stok)
        setCategoryId(product.category_id)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`http://localhost:3000/products/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nama,
                    harga: Number(harga),
                    stok: Number(stok),
                    category_id: Number(categoryId)
                })
            })

            const data = await response.json()

            console.log(data)

            if (!response.ok) {
                alert(data.message || 'Gagal mengubah produk')
                return
            }

            const updatedProducts = await fetch('http://localhost:3000/products')
            const productsData = await updatedProducts.json()

            setProducts(productsData)

            setEditId(null)
            setNama('')
            setHarga('')
            setStok('')
            setCategoryId('')

        } catch (error) {
            console.error('Error:', error)
        }
    }

    const filteredProducts = products.filter(product => {
        const cocokNama = product.nama
            .toLowerCase()
            .includes(search.toLowerCase())

        const cocokKategori =
            filterCategory === '' ||
            String(product.category_id) === filterCategory

        return cocokNama && cocokKategori
    })

    return (
        <div className="products-page">

            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage and organize your inventory products</p>
                </div>
            </div>

            <div className="products-toolbar">

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="category-filter"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="">All Categories</option>

                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.nama}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={handleDownloadTemplate}
                >
                    Download Template
                </button>

                <label className="file-upload-button">
                    Choose Excel File
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={e => setImportFile(e.target.files[0])}
                    />
                </label>

                {importFile && (
                    <span className="selected-file">
                        {importFile.name}
                    </span>
                )}

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleImportExcel}
                >
                    Preview Excel
                </button>
            </div>

            {importPreview.length > 0 && (
                <div className="import-preview">
                    <h3>Import Preview</h3>

                    <div className="import-preview-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {importPreview.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.nama}</td>
                                        <td>{item.kategori}</td>
                                        <td>{item.harga}</td>
                                        <td>{item.stok}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="import-preview-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                                setImportPreview([])
                                setImportFile(null)
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={handleConfirmImport}
                        >
                            Confirm Import
                        </button>
                    </div>
                </div>
            )}

            <div className="product-form-card">

                <div className="product-form-header">
                    <div>
                        <h2>
                            {editId ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <p>
                            {editId
                                ? 'Update product information'
                                : 'Add a new product to your inventory'}
                        </p>
                    </div>
                </div>

                <form onSubmit={editId ? handleUpdate : handleSubmit}>

                    <div className="product-form-grid">

                        <div className="form-group">
                            <label>Product Name</label>

                            <input
                                type="text"
                                placeholder="Enter product name"
                                value={nama}
                                onChange={e => setNama(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>

                            <input
                                type="number"
                                placeholder="Enter price"
                                value={harga}
                                onChange={e => setHarga(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock</label>

                            <input
                                type="number"
                                placeholder="Enter stock quantity"
                                value={stok}
                                onChange={e => setStok(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>

                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                            >
                                <option value="">Select category</option>

                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div className="product-form-actions">

                        <button type="submit" className="primary-button">
                            {editId ? 'Save Changes' : 'Add Product'}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                    setEditId(null)
                                    setNama('')
                                    setHarga('')
                                    setStok('')
                                    setCategoryId('')
                                }}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>
            </div>

            <div className="products-table-card">

                <div className="products-table-wrapper">

                    <table className="products-table">

                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="table-empty">
                                            No products found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="product-name-cell">
                                                <strong>{product.nama}</strong>
                                                <span>Product ID: #{product.id}</span>
                                            </div>
                                        </td>

                                        <td>
                                            {product.kategori || '-'}
                                        </td>

                                        <td>
                                            Rp{Number(product.harga).toLocaleString('id-ID')}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    Number(product.stok) < 10
                                                        ? 'stock-status low'
                                                        : 'stock-status'
                                                }
                                            >
                                                {product.stok} unit
                                            </span>
                                        </td>

                                        <td>
                                            <div className="table-actions">

                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(product.id)}
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

export default Products