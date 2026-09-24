import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import stockitIcon from './assets/stockit-icon.png'
import stockitText from './assets/stockit-text.png'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import Login from './pages/Login'

function App() {
    const token = localStorage.getItem('token')

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    return (
        <BrowserRouter>
            {token ? (
                <div className="app-layout">

                    <aside className="sidebar">
                        <div className="sidebar-brand">
                            <div className="sidebar-logo">
                                <img
                                    className="sidebar-logo-icon"
                                    src={stockitIcon}
                                    alt="Stockit Icon"
                                />

                                <img
                                    className="sidebar-logo-text"
                                    src={stockitText}
                                    alt="Stockit"
                                />
                            </div>
                                <p className="sidebar-description">
                                    Inventory Management System
                                </p>
                        </div>

                        <nav className="sidebar-nav">
                            <Link to="/">
                                Dashboard
                            </Link>

                            <Link to="/products">
                                Products
                            </Link>

                            <Link to="/categories">
                                Categories
                            </Link>

                            <Link to="/suppliers">
                                Suppliers
                            </Link>

                            <Link to="/stock">
                                Stock
                            </Link>

                            <Link to="/reports">
                                Reports
                            </Link>
                        </nav>

                        <div className="sidebar-footer">
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </aside>

                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/suppliers" element={<Suppliers />} />
                            <Route path="/stock" element={<Stock />} />
                            <Route path="/reports" element={<Reports />} />

                            <Route
                                path="/login"
                                element={<Navigate to="/" />}
                            />
                        </Routes>
                    </main>

                </div>
            ) : (
                <Routes>
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" />}
                    />
                </Routes>
            )}
        </BrowserRouter>
    )
}

export default App