import { useState } from "react";

export default function ComplaintForm() {
  const [email, setEmail] = useState("");
  const [complaint, setComplaint] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, complaint }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Error connecting to backend:", err);
    }
  };

  return (
    <div>
      <h2>Submit Complaint</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Your complaint"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
