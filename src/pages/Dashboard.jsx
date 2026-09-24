import { useEffect, useState } from 'react'

function Dashboard() {
    const [products, setProducts] = useState([])

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

    const totalProduk = products.length

    const totalStok = products.reduce(
        (total, product) => total + Number(product.stok),
        0
    )

    const stokMenipis = products.filter(
        product => Number(product.stok) < 10
    ).length

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Overview of your inventory</p>
                </div>
            </div>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <span>Total Products</span>
                        <span className="dashboard-card-icon products-icon">
                            P
                        </span>
                    </div>

                    <p className="dashboard-card-value">
                        {totalProduk}
                    </p>

                    <span className="dashboard-card-description">
                        Registered products
                    </span>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <span>Total Stock</span>
                        <span className="dashboard-card-icon stock-icon">
                            S
                        </span>
                    </div>

                    <p className="dashboard-card-value">
                        {totalStok}
                    </p>

                    <span className="dashboard-card-description">
                        Units available
                    </span>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <span>Low Stock</span>
                        <span className="dashboard-card-icon warning-icon">
                            !
                        </span>
                    </div>

                    <p className="dashboard-card-value">
                        {stokMenipis}
                    </p>

                    <span className="dashboard-card-description">
                        Requires attention
                    </span>
                </div>

            </div>

            <div className="low-stock-section">

                <div className="section-header">
                    <div>
                        <h2>Low Stock</h2>
                        <p>Products that require attention</p>
                    </div>
                </div>

                {products.filter(product => Number(product.stok) < 10).length === 0 ? (
                    <div className="empty-state">
                        <p>All stock levels are healthy.</p>
                    </div>
                ) : (
                    <div className="low-stock-list">

                        {products
                            .filter(product => Number(product.stok) < 10)
                            .map(product => (
                                <div className="low-stock-item" key={product.id}>

                                    <div className="low-stock-product">
                                        <strong>{product.nama}</strong>
                                        <span>Product ID: #{product.id}</span>
                                    </div>

                                    <div className="low-stock-status">
                                        <span className="stock-badge">
                                            {product.stok} units
                                        </span>

                                        <span className="warning-label">
                                            Low stock
                                        </span>
                                    </div>

                                </div>
                            ))}

                    </div>
                )}

            </div>
        </div>
    )
}

export default Dashboard