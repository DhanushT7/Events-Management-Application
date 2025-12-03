import { useState, useEffect, createContext } from "react";
import NavbarHod from "./utils/navbar";
import Overview from "./drawerPages/overview/overview";
import Proposals from "./drawerPages/proposals";
import ApprovedEvents from "./drawerPages/approvedEvents";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { eventState } from "../../../shared/context/eventProvider";
import PendingProposals from "./drawerPages/pendingProposals";
import Finance from "./drawerPages/Finance/Finance";
import FinalBudget from "./drawerPages/Finance/finalBudget";
import ProposalLetter from "./utils/proposalLetter";
import ConvenorCommitteeManagement from "./Components/ConvenorCommitteeManagement";
import SignatureManagement from "./Components/SignatureManagement";
import EnhancedHODProfile from "./Components/EnhancedHODProfile";
import EventCalendar from "./Components/EventCalendar";
import NotificationCenter from "./Components/NotificationCenter";

export const SelectedEventContext = createContext();

const HodDashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState("");
  const { user, events, setEvents } = eventState();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  function fetchAllEvents() {
    const token = localStorage.getItem("token");

    try {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/hod/allEvents/`, {
        method: "GET",
        headers:{
          "Authorization": `Bearer ${token}`,
          "Content-Type" : "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/';
            return;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {

            setEvents(data);
            setLastRefresh(Date.now());
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching events:", error);
        });
    } catch (error) {

    }
  }

  // Manual refresh function
  const handleRefreshData = () => {
    fetchAllEvents();
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Auto-refresh every 30 seconds when user is on finance page
  useEffect(() => {
    let interval;
    if (activePage === "finance" || activePage === "finalBudget") {
      interval = setInterval(() => {

        fetchAllEvents();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activePage]);

  return (
    <SelectedEventContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      <Box>
        <NavbarHod
          activePage={activePage}
          setActivePage={setActivePage}
          onRefresh={handleRefreshData}
        ></NavbarHod>
        <Box>
          {activePage === "overview" && (
            <Overview
              activePage={activePage}
              setActivePage={setActivePage}
            ></Overview>
          )}
          {activePage === "proposal" && (
            <Proposals activePage={activePage} setActivePage={setActivePage} />
          )}
          {activePage === "approved" && <ApprovedEvents />}
          {activePage === "pendingProposal" && <PendingProposals />}
          {activePage === "finance" && (
            <Finance 
              activePage={activePage} 
              setActivePage={setActivePage} 
              lastRefresh={lastRefresh}
            />
          )}
          {activePage === "finalBudget" && (
            <FinalBudget
              activePage={activePage}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "proposalLetterView" && (
            <ProposalLetter
              activePage={activePage}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "convenorCommittee" && (
            <ConvenorCommitteeManagement />
          )}

          {activePage === "signatureManagement" && (
            <SignatureManagement />
          )}

          {activePage === "profile" && (
            <EnhancedHODProfile />
          )}

          {activePage === "calendar" && (
            <EventCalendar />
          )}

          {activePage === "notifications" && (
            <NotificationCenter />
          )}
        </Box>
      </Box>
    </SelectedEventContext.Provider>
  );
};

export default HodDashboard;
