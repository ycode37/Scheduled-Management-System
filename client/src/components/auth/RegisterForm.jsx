import { useState } from "react";
import { apiFetch } from "../../api/client"; 

export default function RegisterForm({ onSuccess }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!username || !email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            await apiFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ username, email, password }),
            });

            setSuccessMsg("Account created! Please log in.");

            // Switch AuthPage back to login after a short moment
            setTimeout(() => {
                if (typeof onSuccess === "function") onSuccess();
            }, 600);
        } catch (err) {
            setError(err?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="StudioDesignCo"
                />
            </div>

            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="design@studio.com"
                />
            </div>

            <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
            </div>

            {error && <p className="error-msg" style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
            {successMsg && <p className="success-msg" style={{ margin: 0, color: "var(--safe)" }}>{successMsg}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Register"}
            </button>
        </form>
    );
}