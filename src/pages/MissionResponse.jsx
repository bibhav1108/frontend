import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

const MissionResponse = () => {
  const { campaign_id } = useParams();
  const [searchParams] = useSearchParams();
  const vol_id = searchParams.get("vol_id");

  const [campaign, setCampaign] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await API.get(`/campaigns/${campaign_id}`);
        setCampaign(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCampaign();
  }, [campaign_id]);

  const handleAccept = async () => {
    try {
      const res = await API.post(
        `/campaigns/${campaign_id}/opt-in?vol_id=${vol_id}`,
      );
      setStatus(res.data.message);
    } catch {
      setStatus("Error while accepting");
    }
  };

  const handleReject = async () => {
    try {
      const res = await API.post(
        `/campaigns/${campaign_id}/reject?vol_id=${vol_id}`,
      );
      setStatus(res.data.message);
    } catch {
      setStatus("Error while rejecting");
    }
  };

  if (!campaign) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{campaign.name}</h1>
      <p>{campaign.description}</p>

      <p>
        <b>Location:</b> {campaign.location_address}
      </p>
      <p>
        <b>Skills:</b> {campaign.required_skills?.join(", ")}
      </p>

      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>

      {status && <p>{status}</p>}
    </div>
  );
};

export default MissionResponse;
