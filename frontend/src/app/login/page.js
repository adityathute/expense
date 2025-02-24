"use client";
import Link from "next/link";
import "./login.css"; // Import the CSS file

export default function Login() {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Welcome to the Shivanya Multiservices</h1>
                <Link href="http://127.0.0.1:8001/auth/login"><button className="btn btn-primary">Getting Started 🚀</button></Link>
            </div>
        </div>
    );
}
