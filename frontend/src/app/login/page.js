"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "../components/Loader";
import useLoading from "../hooks/useLoading";
import "./login.css";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const { loading, showLoading } = useLoading();

  function handleLogin(e) {
    e.preventDefault();

    showLoading(); // show loader immediately

    const token = "dev123";
    const expires = new Date(Date.now() + 86400000).toUTCString();
    document.cookie = `access_token=${token}; path=/; expires=${expires}; SameSite=Lax`;

    setTimeout(() => {
      window.location.href = nextUrl;  // full refresh
    }, 200);
  }

  return (
    <>
      {loading && <Loader />}

      <div className="login-container">
        <div className="login-box">
          <h1>Welcome to Shivanya Multiservices</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <input required placeholder="Username" />
            <input type="password" required placeholder="Password" />
            <button className="login-btn">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}
