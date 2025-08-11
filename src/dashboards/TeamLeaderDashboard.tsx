import React, { useState, useEffect } from "react";
import Logo from "../assets/logo/mas-holdings-logo-seeklogo.png";
import { IoIosWarning } from "react-icons/io";
import { VscVmActive } from "react-icons/vsc";
import { MdOutlinePendingActions } from "react-icons/md";

import AddMachine from "../forms/AddMachine.tsx";

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  status: string;
  breakdownStartTime: string;
  m_ArrivalTime?: string;
  breakdownEndTime?: string;
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

const TeamLeaderDashboard: React.FC = () => {
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
  const calculateDowntime = (machine: Machine) => {
    const start = new Date(machine.breakdownStartTime).getTime();
    const end = machine.breakdownEndTime
      ? new Date(machine.breakdownEndTime).getTime()
      : null;

    if (end) {
      // downtime is fixed duration between breakdown start and end
      return formatDuration(end - start);
    } else {
      // downtime is time since breakdown start until now
      return formatDuration(now - start);
    }
  };

  //get machines from backend
  const fetchMachines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/machines");
      if (!res.ok) {
        throw new Error("Failed to fetch machines");
      }
      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  const getStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "down":
        return "bg-gradient-to-br from-[#ed1c24] to-red-700";
      case "arrived":
        return "bg-gradient-to-br from-yellow-400 to-amber-600 text-white";
      case "running":
        return " bg-gradient-to-br from-green-500 to-emerald-700 text-white";
      default:
        return "";
    }
  };

  const getIcon = (status: Machine["status"]) => {
    switch (status) {
      case "down": // Machine is down
        return <IoIosWarning className="text-red-500 w-8 h-8" />;
      case "arrived": // Mechanic arrived
        return <MdOutlinePendingActions className="text-yellow-500 w-8 h-8" />;
      case "running": // Machine running
        return <VscVmActive className="text-green-500 w-8 h-8" />;
      default: // Fallback
        return null;
    }
  };

  const [showAddMachineForm, setShowAddMachineForm] = useState(false);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-md">
        <div>
          <h1 className="lg:text-3xl lg:block hidden text-2xl font-extrabold text-gray-800 tracking-tight">
            Team Leader Dashboard{" "}
          </h1>
          <p className="text-gray-600 mt-5">
            Here you can monitor the performance and status of your team.
          </p>
        </div>
        <div>
          <img
            src={Logo}
            alt="Logo"
            className="h-24 mr-10 w-auto object-contain"
          />
        </div>
      </div>

      {/*Search Bar*/}
      <div className="mb-6 flex gap-8">
        <div className="w-9/10">
          <input
            type="text"
            placeholder="Search Machine"
            className="w-full p-3 rounded-lg bg-white/80 backdrop-blur-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="w-1/10">
          <button
            onClick={() => setShowAddMachineForm((prev) => !prev)}
            className="px-4 p-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors"
          >
            {showAddMachineForm ? "Close Form" : "Add Machine"}
          </button>
        </div>
      </div>
      {showAddMachineForm && (
        <div className="mt-6 z-0">
          <AddMachine />
        </div>
      )}



      {/* Main Content */}
      <div className="bg- backdrop-blur-md p-6 rounded-xl shadow-lg grid grid-cols-4 gap-6">
        {machines.map((machine) => (
          <div
            className={`rounded-xl shadow-lg flex items-center p-4 text-white justify-between ${getStatusColor(
              machine.status
            )}`}
          >
            <div key={machine._id}>
              <div className="text-lg font-bold">{machine.machineName}</div>
              <div className="text-sm opacity-90">b</div>
              <div className="text-xs opacity-80">c</div>
            </div>

            <div className="w-1/4 flex items-center justify-center bg-ternary/90 rounded-full p-2 shadow-inner">
              {getIcon(machine.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;
