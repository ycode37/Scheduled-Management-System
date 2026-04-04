import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--ink-900)",
            padding: "24px",
            textAlign: "center",
        }}>
            <h1 style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(3rem, 10vw, 6rem)",
                lineHeight: 0.9,
                marginBottom: "16px",
                color: "var(--chalk-100)",
            }}>
                404
            </h1>
            <p style={{
                color: "var(--chalk-300)",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
                marginBottom: "32px",
            }}>
                The page you're looking for doesn't exist.
            </p>
            <Link to={"/"} style={{ textDecoration: "none" }}>
                <button style={{
                    background: "var(--chalk-100)",
                    color: "var(--ink-900)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "14px 28px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    fontFamily: "var(--font-main)",
                }}>
                    Go back Home
                </button>
            </Link>
        </div>
    )
}