import { useState } from "react";
import { loginUser } from "../api/auth.api";

function Login() {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🚨 REQUIRED

    console.log("Login clicked"); // DEBUG

    try {
      const res = await loginUser({
        userName,
        password,
      });

      console.log("Login success:", res.data);
    } catch (err) {
      console.error("Login error:", err.response?.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={userName}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
