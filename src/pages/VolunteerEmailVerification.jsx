import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";

const VerifyEmail = () => {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await API.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };

    verify();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-xl font-bold">✅ Email Verified</h1>
          <p>You can now go back to the app.</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-xl font-bold">❌ Verification Failed</h1>
          <p>Invalid or expired link.</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
