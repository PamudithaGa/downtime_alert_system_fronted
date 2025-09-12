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
  time?: string;
  breakdownEndTime?: string;
  // time?: string;
  issue?: string;
  timestamp?: string;
}

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  status: string;
  timestamp?: string;
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

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 1000);
    return () => clearInterval(interval);
  }, []);



  const fetchMachines = async () => {
    try {
      const res = await fetch(
        "https://downtimealertsystembackend-production.up.railway.app/api/machines"
      );
      if (!res.ok) throw new Error("Failed to fetch machines");
      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  // const calculateTotalDowntime = (
  //   logs: MachineLog[],
  //   machineStatus: string
  // ) => {
  //   if (machineStatus === "running") return "0m";

  //   const lastDown = [...logs].reverse().find((log) => log.status === "down");
  //   if (!lastDown) return "N/A";

  //   const start = lastDown.time || lastDown.timestamp;
  //   if (!start) return "N/A";

  //   const durationMs = Date.now() - Date.parse(start);
  //   return formatDuration(durationMs);
  // };

  // const calculateCurrentDowntime = (
  //   logs: MachineLog[],
  //   machineStatus: string
  // ) => {
  //   const startOfDay = new Date();
  //   startOfDay.setHours(0, 0, 0, 0);

  //   const filteredLogs = logs.filter((log) => {
  //     if (!log.timestamp) return false;
  //     const ts = Date.parse(log.timestamp);
  //     return ts >= startOfDay.getTime();
  //   });

  //   const sortedLogs = [...filteredLogs].sort(
  //     (a, b) => Date.parse(a.timestamp ?? "") - Date.parse(b.timestamp ?? "")
  //   );

  //   let totalMs = 0;
  //   let activeStart: string | null = null;

  //   for (const log of sortedLogs) {
  //     if (log.status === "down") {
  //       activeStart = log.time || log.timestamp || null;
  //     } else if (log.status === "running" && activeStart) {
  //       const end = log.breakdownEndTime || log.timestamp;
  //       if (end) totalMs += Date.parse(end) - Date.parse(activeStart);
  //       activeStart = null;
  //     }
  //   }

  //   // If still down after midnight, count from midnight instead of yesterday
  //   if (activeStart && machineStatus !== "running") {
  //     const downStart = Date.parse(activeStart);
  //     const effectiveStart = Math.max(downStart, startOfDay.getTime());
  //     totalMs += Date.now() - effectiveStart;
  //   }

  //   return formatDuration(totalMs);
  // };

  // 👉 Shows only the *ongoing downtime* if the machine is down right now

  // Current ongoing downtime
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

  // Total downtime today (all intervals + ongoing if still down)
  const calculateTotalDowntime = (
    logs: MachineLog[],
    machineStatus: string
  ) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const filteredLogs = logs.filter((log) => {
      if (!log.timestamp) return false;
      const ts = Date.parse(log.timestamp);
      return ts >= startOfDay.getTime();
    });

    const sortedLogs = [...filteredLogs].sort(
      (a, b) => Date.parse(a.timestamp ?? "") - Date.parse(b.timestamp ?? "")
    );

    let totalMs = 0;
    let activeStart: string | null = null;

    for (const log of sortedLogs) {
      if (log.status === "down") {
        activeStart = log.time || log.timestamp || null;
      } else if (log.status === "running" && activeStart) {
        const end = log.breakdownEndTime || log.timestamp;
        if (end) totalMs += Date.parse(end) - Date.parse(activeStart);
        activeStart = null;
      }
    }

    // If machine is still down → include ongoing downtime
    if (activeStart && machineStatus !== "running") {
      const downStart = Date.parse(activeStart);
      const effectiveStart = Math.max(downStart, startOfDay.getTime());
      totalMs += Date.now() - effectiveStart;
    }

    return formatDuration(totalMs);
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
                  Current:{" "}
                  {calculateCurrentDowntime(machine.logs, machine.status)}
                </div>
                <div className="text-xs opacity-80">
                  Total Today:{" "}
                  {calculateTotalDowntime(machine.logs, machine.status)}
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
