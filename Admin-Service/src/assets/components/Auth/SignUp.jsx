import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch("http://localhost:8001/api/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log('Signup response:', data);

            if (res.ok && data.status) {
                alert(data.message || "Signup successful!");
                localStorage.setItem("email", formData.email);
                navigate("/verifyOtp");
            } else {
                if (data.error?.password) {
                    setError(data.error.password.join(" "));
                } else {
                    setError(data.message || "Signup failed.");
                }
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
            <h2>Signup</h2>
            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "400px",
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ margin: "10px 0", padding: "10px" }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ margin: "10px 0", padding: "10px" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ margin: "10px 0", padding: "10px" }}
                />
                <button type="submit" style={{ padding: "10px", margin: "10px 0" }}>
                    Sign Up
                </button>
                {error && <div style={{ color: "red", fontSize: "14px" }}>{error}</div>}
            </form>
 
            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
                Already have an account? <Link to="/api/user/login">Log In</Link>
            </div>
        </div>
    );
};

export default Signup;
