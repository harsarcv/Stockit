import { useEffect, useRef, useState } from 'react'

function Stock() {
    const [products, setProducts] = useState([])
    const [productId, setProductId] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [productDropdownOpen, setProductDropdownOpen] = useState(false)
    const productDropdownRef = useRef(null)
    const [jumlah, setJumlah] = useState('')
    const [keterangan, setKeterangan] = useState('')
    const [suppliers, setSuppliers] = useState([])
    const [supplierId, setSupplierId] = useState('')
    const [outProductId, setOutProductId] = useState('')
    const [outProductSearch, setOutProductSearch] = useState('')
    const [outProductDropdownOpen, setOutProductDropdownOpen] = useState(false)
    const outProductDropdownRef = useRef(null)
    const [outJumlah, setOutJumlah] = useState('')
    const [outKeterangan, setOutKeterangan] = useState('')
    const [penerima, setPenerima] = useState('')

    useEffect(() => {
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(data => {
                setProducts(data)
            })
    }, [])

    useEffect(() => {
        fetch('http://localhost:3000/suppliers')
            .then(response => response.json())
            .then(data => {
                console.log('DATA SUPPLIER:', data)
                setSuppliers(data)
            })
            .catch(error => {
                console.error('Gagal mengambil supplier:', error)
            })
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                productDropdownRef.current &&
                !productDropdownRef.current.contains(event.target)
            ) {
                setProductDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                outProductDropdownRef.current &&
                !outProductDropdownRef.current.contains(event.target)
            ) {
                setOutProductDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleStockIn = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem('token')

        console.log('TOKEN ADA:', !!token)
        console.log('TIPE TOKEN:', typeof token)
        console.log('PANJANG TOKEN:', token ? token.length : null)
        console.log('TOKEN:', token)

        console.log('SUPPLIER ID:', supplierId)

        const response = await fetch('http://localhost:3000/stock/in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: Number(productId),
                jumlah: Number(jumlah),
                supplier_id: Number(supplierId),
                keterangan
            })
        })

        const data = await response.json()

        console.log(data)

        setProductId('')
        setSupplierId('')
        setJumlah('')
        setKeterangan('')
        setProductSearch('')
        setProductDropdownOpen(false)

        const updatedResponse = await fetch('http://localhost:3000/products')
        const updatedData = await updatedResponse.json()

        setProducts(updatedData)

        const updatedHistoryResponse = await fetch('http://localhost:3000/stock/history')
        const updatedHistory = await updatedHistoryResponse.json()

        setHistory(updatedHistory)
    }

    const handleStockOut = async (e) => {
        e.preventDefault()

        const response = await fetch('http://localhost:3000/stock/out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                product_id: Number(outProductId),
                jumlah: Number(outJumlah),
                penerima,
                keterangan: outKeterangan
            })
        })

        const data = await response.json()

        console.log(data)

        setOutProductId('')
        setOutJumlah('')
        setPenerima('')
        setOutKeterangan('')
        setOutProductSearch('')
        setOutProductDropdownOpen(false)

        const updatedResponse = await fetch('http://localhost:3000/products')
        const updatedData = await updatedResponse.json()

        setProducts(updatedData)

        const updatedHistoryResponse = await fetch('http://localhost:3000/stock/history')
        const updatedHistory = await updatedHistoryResponse.json()

        setHistory(updatedHistory)
    }

    return (
        <div className="stock-page">

            <div className="page-header">
                <div>
                    <h1>Stock Management</h1>
                    <p>Manage stock movements and monitor inventory history</p>
                </div>
            </div>


            <div className="stock-forms">

                {/* STOCK IN */}

                <div className="stock-form-card stock-in-card">

                    <div className="stock-form-header">
                        <div className="stock-form-icon stock-in-icon">
                            +
                        </div>

                        <div>
                            <h2>Stock In</h2>
                            <p>Add stock to your inventory</p>
                        </div>
                    </div>


                    <form onSubmit={handleStockIn}>

                    <div className="form-group">
                        <label>Product</label>

                        <div
                            className="searchable-select"
                            ref={productDropdownRef}
                        >
                            <input
                                type="text"
                                placeholder="Select product"
                                value={
                                    productId
                                        ? products.find(
                                            product => product.id === Number(productId)
                                        )?.nama || ''
                                        : productSearch
                                }
                                onChange={e => {
                                    setProductSearch(e.target.value)
                                    setProductId('')
                                    setProductDropdownOpen(true)
                                }}
                                onFocus={() => setProductDropdownOpen(true)}
                            />

                            {productDropdownOpen && (
                                <div className="searchable-options">
                                    {products
                                        .filter(product =>
                                            product.nama
                                                .toLowerCase()
                                                .includes(productSearch.toLowerCase())
                                        )
                                        .map(product => (
                                            <div
                                                key={product.id}
                                                className="searchable-option"
                                                onMouseDown={() => {
                                                    setProductId(product.id)
                                                    setProductSearch('')
                                                    setProductDropdownOpen(false)
                                                }}
                                            >
                                                {product.nama}
                                            </div>
                                        ))}

                                    {products.filter(product =>
                                        product.nama
                                            .toLowerCase()
                                            .includes(productSearch.toLowerCase())
                                    ).length === 0 && (
                                        <div className="searchable-no-result">
                                            No product found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                        <div className="form-group">
                            <label>Supplier</label>

                            <select
                                value={supplierId}
                                onChange={e => {
                                    console.log('SUPPLIER DIPILIH:', e.target.value)
                                    setSupplierId(e.target.value)
                                }}
                            >
                                <option value="">Select supplier</option>

                                {suppliers.map(supplier => (
                                    <option
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>

                            <input
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                value={jumlah}
                                onChange={e => setJumlah(e.target.value)}
                            />
                        </div>


                        <div className="form-group">
                            <label>Description</label>

                            <input
                                type="text"
                                placeholder="Optional description"
                                value={keterangan}
                                onChange={e => setKeterangan(e.target.value)}
                            />
                        </div>


                        <button
                            type="submit"
                            className="stock-submit-button stock-in-button"
                        >
                            Add Stock
                        </button>

                    </form>

                </div>


                {/* STOCK OUT */}

                <div className="stock-form-card stock-out-card">

                    <div className="stock-form-header">
                        <div className="stock-form-icon stock-out-icon">
                            −
                        </div>

                        <div>
                            <h2>Stock Out</h2>
                            <p>Remove stock from your inventory</p>
                        </div>
                    </div>


                    <form onSubmit={handleStockOut}>

                        <div className="form-group">
                            <label>Product</label>

                            <div
                                className="searchable-select"
                                ref={outProductDropdownRef}
                            >
                                <input
                                    type="text"
                                    placeholder="Select product"
                                    value={
                                        outProductId
                                            ? products.find(
                                                product => product.id === Number(outProductId)
                                            )?.nama || ''
                                            : outProductSearch
                                    }
                                    onChange={e => {
                                        setOutProductSearch(e.target.value)
                                        setOutProductId('')
                                        setOutProductDropdownOpen(true)
                                    }}
                                    onFocus={() => setOutProductDropdownOpen(true)}
                                />

                                {outProductDropdownOpen && (
                                    <div className="searchable-options">
                                        {products
                                            .filter(product =>
                                                product.nama
                                                    .toLowerCase()
                                                    .includes(outProductSearch.toLowerCase())
                                            )
                                            .map(product => (
                                                <div
                                                    key={product.id}
                                                    className="searchable-option"
                                                    onMouseDown={() => {
                                                        setOutProductId(product.id)
                                                        setOutProductSearch('')
                                                        setOutProductDropdownOpen(false)
                                                    }}
                                                >
                                                    {product.nama}
                                                </div>
                                            ))}

                                        {products.filter(product =>
                                            product.nama
                                                .toLowerCase()
                                                .includes(outProductSearch.toLowerCase())
                                        ).length === 0 && (
                                            <div className="searchable-no-result">
                                                No product found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Recipient</label>

                            <input
                                type="text"
                                placeholder="Enter recipient or department"
                                value={penerima}
                                onChange={e => setPenerima(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>

                            <input
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                value={outJumlah}
                                onChange={e => setOutJumlah(e.target.value)}
                            />
                        </div>


                        <div className="form-group">
                            <label>Description</label>

                            <input
                                type="text"
                                placeholder="Optional description"
                                value={outKeterangan}
                                onChange={e => setOutKeterangan(e.target.value)}
                            />
                        </div>


                        <button
                            type="submit"
                            className="stock-submit-button stock-out-button"
                        >
                            Remove Stock
                        </button>

                    </form>

                </div>

            </div>


            {/* CURRENT STOCK */}

            <div className="current-stock-section">

                <div className="section-header">
                    <div>
                        <h2>Current Stock</h2>
                        <p>Current inventory quantity by product</p>
                    </div>
                </div>


                <div className="stock-table-card">

                    <div className="stock-table-wrapper">

                        <table className="stock-table">

                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Product</th>
                                    <th>Product ID</th>
                                    <th>Current Stock</th>
                                </tr>
                            </thead>

                            <tbody>

                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">
                                            <div className="table-empty">
                                                No products found.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product, index) => (
                                        <tr key={product.id}>

                                            <td>{index + 1}</td>

                                            <td>
                                                <strong className="stock-product-name">
                                                    {product.nama}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="stock-product-id">
                                                    #{product.id}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        Number(product.stok) < 10
                                                            ? 'stock-quantity low'
                                                            : 'stock-quantity'
                                                    }
                                                >
                                                    {product.stok} unit
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Stock