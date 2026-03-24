import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const volunteerId = location.state?.volunteerId;

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("volunteers")) || [];

    const updated = stored.map((v) =>
      v.id === volunteerId ? { ...v, verified: true } : v,
    );

    // 🔥 SAVE updated data
    localStorage.setItem("volunteers", JSON.stringify(updated));

    alert("Volunteer Verified ✅");

    navigate("/volunteers");
  };

  return (
    <Layout>
      <div className="max-w-md bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Verify Volunteer</h2>

        <form onSubmit={handleVerify}>
          <input
            className="w-full mb-4 p-2 border rounded text-center text-lg tracking-widest"
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Verify
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Verify;
