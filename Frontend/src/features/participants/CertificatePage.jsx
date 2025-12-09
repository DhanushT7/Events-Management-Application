import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../../styles/CertificatePage.css";
import { useSnackbar } from "notistack";

const CertificatePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEligibleEvents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo")); // assumes your user info has ID
      const token = localStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/my-certificates/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(res.data);
    } catch (err) {
      enqueueSnackbar("Failed to fetch eligible events", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (event) => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    const doc = new jsPDF();

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CERTIFICATE OF PARTICIPATION", 30, 30);

    doc.setFont("normal");
    doc.setFontSize(14);
    doc.text(`This is to certify that`, 20, 50);
    doc.setFont("bold");
    doc.text(`${user.name}`, 20, 60);

    doc.setFont("normal");
    doc.text(`has participated in the event`, 20, 70);
    doc.setFont("bold");
    doc.text(`"${event.eventId.title}"`, 20, 80);

    doc.setFont("normal");
    doc.text(`held from ${new Date(event.eventId.startDate).toDateString()} to ${new Date(event.eventId.endDate).toDateString()}.`, 20, 90);

    doc.setFont("italic");
    doc.text(`Department of CSE, Anna University, CEG`, 20, 110);
    doc.text("Coordinator Signature", 150, 140);

    doc.save(`${user.name}_${event.eventId.title}_certificate.pdf`);
  };

  useEffect(() => {
    fetchEligibleEvents();
  }, []);

  if (loading) return <p className="center-text">Loading certificates...</p>;

  return (
    <div className="certificate-container">
      <h2 className="certificate-heading">My Certificates</h2>
      {events.length === 0 ? (
        <p className="center-text">No eligible certificates yet.</p>
      ) : (
        <ul className="certificate-list">
          {events.map((event) => (
            <li key={event.eventId} className="certificate-item">
              <span>{event.eventId.title} ({new Date(event.eventId.startDate).toDateString()})</span>
              <button onClick={() => generatePDF(event)}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CertificatePage;
