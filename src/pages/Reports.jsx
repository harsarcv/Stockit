import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

function Reports() {
    const [history, setHistory] = useState([])
    const [filterProduct, setFilterProduct] = useState('')
    const [filterType, setFilterType] = useState('')

    useEffect(() => {
        fetch('http://localhost:3000/stock/history')
            .then(response => response.json())
            .then(data => {
                setHistory(data)
            })
            .catch(error => {
                console.error('Gagal mengambil laporan stok:', error)
            })
    }, [])

    const filteredHistory = history.filter(item => {

        const cocokProduct =
            filterProduct === '' ||
            String(item.product_id) === filterProduct

        const cocokType =
            filterType === '' ||
            item.tipe === filterType

        return cocokProduct && cocokType
    })

    const filteredStockIn = filteredHistory.filter(
        item => item.tipe === 'masuk'
    ).length

    const filteredStockOut = filteredHistory.filter(
        item => item.tipe === 'keluar'
    ).length

    const handleExport = () => {
        const exportData = filteredHistory.map(item => ({
            Product: item.produk,
            Type: item.tipe === 'masuk' ? 'Stock In' : 'Stock Out',
            Quantity: item.jumlah,
            Supplier: item.supplier || '-',
            Recipient: item.penerima || '-',
            Description: item.keterangan || '-',
            Date: item.created_at
                ? new Date(item.created_at).toLocaleString('id-ID')
                : '-'
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)

        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Stock Movement'
        )

        XLSX.writeFile(
            workbook,
            'stock-report.xlsx'
        )
    }

    return (
        <div className="reports-page">

            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p>View and analyze your inventory stock movements</p>
                </div>
            </div>


            <div className="report-summary">

                <div className="report-summary-card">
                    <span>Total Transactions</span>
                    <strong>{filteredHistory.length}</strong>
                    <small>Stock movements recorded</small>
                </div>

                <div className="report-summary-card">
                    <span>Stock In</span>
                    <strong>
                        {filteredStockIn}
                    </strong>
                    <small>Incoming transactions</small>
                </div>

                <div className="report-summary-card">
                    <span>Stock Out</span>
                    <strong>
                        {filteredStockOut}
                    </strong>
                    <small>Outgoing transactions</small>
                </div>

            </div>


            <div className="report-section">

                <div className="section-header">
                    <div>
                        <h2>Stock Movement</h2>
                        <p>History of all inventory stock transactions</p>
                    </div>
                </div>

                <div className="report-filters">

                    <select
                        value={filterProduct}
                        onChange={e => setFilterProduct(e.target.value)}
                    >
                        <option value="">All Products</option>

                        {[
                            ...new Map(
                                history.map(item => [
                                    item.product_id,
                                    item.produk
                                ])
                            ).entries()
                        ].map(([id, nama]) => (
                            <option key={id} value={id}>
                                {nama}
                            </option>
                        ))}
                    </select>


                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="masuk">Stock In</option>
                        <option value="keluar">Stock Out</option>
                    </select>

                    <button
                        type="button"
                        className="export-button"
                        onClick={handleExport}
                    >
                        Export Excel
                    </button>

                </div>

                <div className="report-table-card">

                    <div className="report-table-wrapper">

                        <table className="report-table">

                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Supplier</th>
                                    <th>Recipient</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            <div className="table-empty">
                                                No stock transactions found.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, index) => (
                                        <tr key={item.id}>

                                            <td>{index + 1}</td>

                                            <td>
                                                <strong className="report-product-name">
                                                    {item.produk}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        item.tipe === 'masuk'
                                                            ? 'transaction-badge in'
                                                            : 'transaction-badge out'
                                                    }
                                                >
                                                    {item.tipe === 'masuk'
                                                        ? 'Stock In'
                                                        : 'Stock Out'}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {item.jumlah} unit
                                                </strong>
                                            </td>

                                            <td>
                                                {item.supplier || '-'}
                                            </td>

                                            <td>
                                                {item.penerima || '-'}
                                            </td>

                                            <td>
                                                {item.keterangan || '-'}
                                            </td>

                                            <td>
                                                {item.created_at
                                                    ? new Date(
                                                        item.created_at
                                                    ).toLocaleString('id-ID')
                                                    : '-'}
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

export default Reports