export default function HelloWorld() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>
        Hello, World!
      </h1>
      <p style={{ fontSize: 18, opacity: 0.6 }}>
        Edit this file and save to see live changes.
      </p>
    </div>
  );
}
