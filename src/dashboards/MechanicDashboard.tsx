import React, { useState, useEffect } from "react";
import Logo from "../assets/logo/mas-holdings-logo-seeklogo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  status: string;
  time: string;
  m_ArrivalTime?: string;
  breakdownEndTime?: string;
  section?: string;
  line?: string;
  logs: MachineLog[];
}

interface MachineLog {
  status: string;
  m_ArrivalTime?: string;
  time?: string;
  breakdownEndTime?: string;
  // time?: string;
  issue?: string;
  timestamp?: string;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

const MechanicDashboard: React.FC = () => {
  // Fetch machines every second
  useEffect(() => {
    fetchMachines(); // Initial fetch

    const interval = setInterval(() => {
      fetchMachines();
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate downtime based on breakdown start and end times
  const calculateCurrentDowntime = (
    logs: MachineLog[],
    machineStatus: string
  ) => {
    if (machineStatus === "running") return "0m";

    const lastDown = [...logs].reverse().find((log) => log.status === "down");
    if (!lastDown) return "N/A";

    const start = lastDown.time || lastDown.timestamp;
    if (!start) return "N/A";

    const durationMs = Date.now() - Date.parse(start);
    return formatDuration(durationMs);
  };

  //get machines
  const fetchMachines = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/machines"
      );
      if (!res.ok) {
        throw new Error("Failed to fetch machines");
      }
      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  // const updateStatus = async (machineId: string, newStatus: string) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:5000/api/machines/${machineId}/status`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ status: newStatus }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to update status");
  //     }

  //     const updatedMachine = await response.json();

  //     // Update the local state so UI changes instantly
  //     setMachines((prev) =>
  //       prev.map((m) => (m._id === machineId ? { ...m, ...updatedMachine } : m))
  //     );
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //   }
  // };

  //get status color based on machine status

  const getStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "down":
        return "bg-red-500 text-white";
      case "arrived":
        return "bg-orange-500 text-white";
      case "running":
        return "bg-green-500 text-white";
      default:
        return "";
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await axios.post(
        "http://localhost:5000/api/auth/logout"
      );

      // Clear JWT
      localStorage.removeItem("token");

      // Redirect to login
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-md">
        <h1 className="lg:text-3xl lg:block hidden text-2xl font-extrabold text-gray-800 tracking-tight">
          Mechanic Dashboard
        </h1>
        <h1 className="lg:hidden block text-2xl font-extrabold text-gray-800 tracking-tight">
          Downtime Alerts
        </h1>
        <div>
          <img
            src={Logo}
            alt="Logo"
            onClick={handleLogout}
            className="h-14 w-auto object-contain"
          />
        </div>
      </div>

      {/* Table- Desktop View */}
      <div className="lg:block hidden overflow-x-auto">
        <table className="w-full bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-4 text-left">Machine Name</th>
              <th className="p-4 text-left">Number</th>{" "}
              <th className="p-4 text-left">Section</th>
              <th className="p-4 text-left">Line</th>
              <th className="p-4 text-left">Downtime</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine, idx) => (
              <tr
                key={machine._id}
                className={`${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white/60"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="p-4 font-medium">{machine.machineName}</td>
                <td className="p-4">{machine.machineId}</td>{" "}
                <td className="p-4">{machine.section}</td>{" "}
                <td className="p-4">{machine.line}</td>
                <td className="p-4">
                  {calculateCurrentDowntime(machine.logs, machine.status)}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(
                      machine.status
                    )}`}
                  >
                    {machine.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden block">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4">
          {machines.map((machine) => (
            <div
              key={machine._id}
              className="mb-4 p-4 border-b last:border-0 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold">{machine.machineName}</h2>
              <p className="text-sm text-gray-600">
                Number: {machine.machineName}
              </p>
              <p className="text-sm text-gray-600">
                Section: {machine.section}
              </p>{" "}
              <p className="text-sm text-gray-600">Line: {machine.line}</p>
              <p className="text-sm text-gray-600">
                Downtime:{" "}
                {calculateCurrentDowntime(machine.logs, machine.status)}
              </p>
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(
                  machine.status
                )}`}
              >
                {machine.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
