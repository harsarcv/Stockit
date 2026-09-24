import { useState } from 'react'
import stockitIcon from '../assets/stockit-icon.png'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        const data = await response.json()
        console.log('LOGIN RESPONSE:', data)

        if (!response.ok) {
            alert(data.message)
            return
        }

        localStorage.setItem('token', data.token)

        window.location.href = '/'
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-brand">
                    <div className="login-logo-icon">
                        <img src={stockitIcon} alt="Stockit" />
                    </div>

                    <div className="login-brand-text">
                        <h1>STOCKIT</h1>
                        <p>Inventory Management System</p>
                    </div>
                </div>


                <div className="login-header">
                    <h2>Welcome back</h2>
                    <p>Sign in to access your inventory dashboard</p>
                </div>


                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>


                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>


                    <button
                        type="submit"
                        className="login-button"
                    >
                        Sign In
                    </button>

                </form>


                <div className="login-footer">
                    <span>Built with React • Node.js • PostgreSQL </span>
                </div>

            </div>

        </div>
    )
}

export default Login