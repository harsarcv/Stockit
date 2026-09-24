function ProductCard({ id, nama, harga, stok, kategori, category_id, onDelete, onEdit }) {
    return (
        <div className="product-card">
            <p>ID: {id}</p>
            <h2>{nama}</h2>
            <p>Harga: Rp{harga}</p>
            <p>Stok: {stok}</p>
            <p>Kategori: {kategori}</p>
            <button onClick={() => onDelete(id)}>Hapus</button>
            <button onClick={() => onEdit({
                id,
                nama,
                harga,
                stok,
                kategori,
                category_id
            })}>
                Edit
            </button>
        </div>
    )
}

export default ProductCard