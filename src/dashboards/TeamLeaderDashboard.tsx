import React, { useState, useEffect } from "react";
import Logo from "../assets/logo/mas-holdings-logo-seeklogo.png";
import { IoIosWarning } from "react-icons/io";
import { VscVmActive } from "react-icons/vsc";
import { MdOutlinePendingActions } from "react-icons/md";
import { MdTabletMac } from "react-icons/md";
import { Link } from "react-router-dom";

interface MachineLog {
  status: string;
  m_ArrivalTime?: string;
  breakdownStartTime?: string;
  breakdownEndTime?: string;
  time?: string;
}

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  status: string;
  logs: MachineLog[];
}

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const TeamLeaderDashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/machines");
      if (!res.ok) throw new Error("Failed to fetch machines");
      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  const calculateDowntime = (machine: Machine) => {
    if (machine.status === "running") return "As soon as possible";
    if (!machine.logs || machine.logs.length === 0) return "N/A";

    const downLog = [...machine.logs]
      .reverse()
      .find((log) => log.status === "down" || log.status === "arrived");

    if (!downLog) return "N/A";

    const startTime = downLog.breakdownStartTime || downLog.m_ArrivalTime;
    if (!startTime) return "N/A";

    const durationMs = now - new Date(startTime).getTime();
    return formatDuration(durationMs);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "down":
        return "bg-gradient-to-br from-[#ed1c24] to-red-700";
      case "arrived":
        return "bg-gradient-to-br from-yellow-400 to-amber-600 text-white";
      case "running":
        return "bg-gradient-to-br from-green-500 to-emerald-700 text-white";
      default:
        return "";
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "down":
        return <IoIosWarning className="text-red-500 w-8 h-8 animate-zoom" />;

      case "arrived":
        return <MdOutlinePendingActions className="text-yellow-500 w-8 h-8" />;
      case "running":
        return <VscVmActive className="text-green-500 w-8 h-8" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md px-4 rounded-xl shadow-md">
        <h1 className="lg:text-3xl lg:flex hidden gap-4 text-2xl font-extrabold text-gray-800 tracking-tight">
          Machine Breakdown Dashboard
          <Link to="/tabletdashboard">
            <MdTabletMac style={{ transform: "rotate(10deg)" }} />
          </Link>
        </h1>
        <img
          src={Logo}
          alt="Logo"
          className="h-24 mr-10 w-auto object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="backdrop-blur-md p-6 rounded-xl shadow-lg grid grid-cols-4 gap-6 w-full">
          {machines.map((machine) => (
            <div
              key={machine._id}
              className={`rounded-xl shadow-lg flex items-center p-4 text-white justify-between ${getStatusColor(
                machine.status
              )}`}
            >
              <div>
                <div className="text-lg font-bold">{machine.machineName}</div>
                <div className="text-sm opacity-90">
                  {machine.status.charAt(0).toUpperCase() +
                    machine.status.slice(1)}
                </div>
                <div className="text-xs opacity-80">
                  Downtime: {calculateDowntime(machine)}
                </div>
              </div>

              <div className="w-1/4 flex items-center justify-center bg-ternary/90 rounded-full p-2 shadow-inner">
                {getIcon(machine.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;
