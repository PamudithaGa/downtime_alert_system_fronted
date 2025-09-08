//dashboards/TabletDashboard.tsx
import React, { useState, useEffect } from "react";
import Logo from "../assets/logo/mas-holdings-logo-seeklogo.png";
import { IoIosWarning } from "react-icons/io";
import { VscVmActive } from "react-icons/vsc";
import { MdOutlinePendingActions, MdTabletMac } from "react-icons/md";
import { Link } from "react-router-dom";
import AddMachine from "../forms/AddMachine";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
// import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ChartDataLabels);

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface MachineLog {
  status: string;
  m_ArrivalTime?: string;
  breakdownStartTime?: string;
  breakdownEndTime?: string;
  reason?: string;
}

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  machineType: string;
  status: string;
  logs: MachineLog[];
  section?: string;
  line?: string;
}

interface LoginFormProps {
  onSuccess: (token: string) => void;
  onClose: () => void;
}

const MechanicLoginModal: React.FC<LoginFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [epf, setEpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("https://downtimealertsystembackend-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epf, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.user?.role !== "mechanic") {
        throw new Error("Only mechanics can update machine status");
      }

      onSuccess(data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Mechanic Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          placeholder="EPF"
          value={epf}
          onChange={(e) => setEpf(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const TabletDashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [now, setNow] = useState(Date.now());
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await fetch("https://downtimealertsystembackend-production.up.railway.app/api/machines/down");
      if (!res.ok) throw new Error("Failed to fetch machines");
      const data = await res.json();
      setMachines(data);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  const [nextStatus, setNextStatus] = useState<"arrived" | "running" | null>(
    null
  );

  const handleArrivedClick = (machineId: string) => {
    setSelectedMachineId(machineId);
    setNextStatus("arrived");
    setShowLogin(true);
  };

  const handleRunningClick = (machineId: string) => {
    setSelectedMachineId(machineId);
    setNextStatus("running");
    setShowLogin(true);
  };

  const handleLoginSuccess = async (token: string) => {
    if (!selectedMachineId || !nextStatus) return;

    try {
      const res = await fetch(
        `https://downtimealertsystembackend-production.up.railway.app/api/machines/${selectedMachineId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setMachines((prev) =>
        prev.map((m) =>
          m._id === selectedMachineId ? { ...m, status: nextStatus } : m
        )
      );

      fetchMachines();
    } catch (err) {
      console.error("Error updating machine status:", err);
    } finally {
      setNextStatus(null); // reset after action
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
        return "bg-gray-400";
    }
  };

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      // Call backend logout API
      await axios.post("https://downtimealertsystembackend-production.up.railway.app/api/auth/logout");

      // Clear JWT
      localStorage.removeItem("token");

      // Redirect to login
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "down":
        return (
          <IoIosWarning className="text-red-500 w-10 h-10 animate-pulse" />
        );
      case "arrived":
        return (
          <MdOutlinePendingActions className="text-yellow-500 w-10 h-10" />
        );
      case "running":
        return <VscVmActive className="text-green-500 w-10 h-10" />;
      default:
        return null;
    }
  };

  const calculateEfficiencyLoss = (downtimeMs: number) => {
    const downtimeMins = Math.floor(downtimeMs / 60000); // convert ms → mins
    const empCount = 20;
    return ((downtimeMins * empCount * 0.6) / 60).toFixed(2); // hours lost
  };

  // Generate PDF Report
  const handlePrintReport = async () => {
    const doc = new jsPDF();

    // Header
    doc.addImage(Logo, "PNG", 150, 10, 40, 20);
    doc.setFontSize(18);
    doc.text("Machine Downtime Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    //Machine Table
    const rows = machines.map((machine) => {
      const downCount = machine.logs.filter((l) => l.status === "down").length;
      const downLog = [...machine.logs]
        .reverse()
        .find((log) => log.status === "down" || log.status === "arrived");

      let downtimeMs = 0;
      if (downLog?.breakdownStartTime) {
        downtimeMs = now - new Date(downLog.breakdownStartTime).getTime();
      }
      const efficiencyLoss = calculateEfficiencyLoss(downtimeMs);

      return [
        machine.machineName,
        machine.section || "N/A",
        machine.line || "N/A",
        downCount,
        `${Math.floor(downtimeMs / 60000)} mins`,
        efficiencyLoss,
      ];
    });

    autoTable(doc, {
      head: [
        [
          "Machine",
          "Section",
          "Line",
          "Down Count",
          "Current Downtime",
          "Efficiency Loss (hrs)",
        ],
      ],
      body: rows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    //Downtime Reasons (Pie Chart )
    const reasonCounts: Record<string, number> = {};
    machines.forEach((machine) => {
      machine.logs
        .filter((l) => l.status === "down" && (l as any).issue)
        .forEach((l: any) => {
          reasonCounts[l.issue] = (reasonCounts[l.issue] || 0) + 1;
        });
    });

    const totalReasons = Object.values(reasonCounts).reduce((a, b) => a + b, 0);
    const reasonPercentages = Object.entries(reasonCounts).map(
      ([reason, count]) => [
        reason,
        count,
        `${((count / totalReasons) * 100).toFixed(1)}%`,
      ]
    );

    if (reasonPercentages.length > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 400;
      document.body.appendChild(canvas);

      const chart = new ChartJS(canvas, {
        type: "pie",
        data: {
          labels: Object.keys(reasonCounts),
          datasets: [
            {
              data: Object.values(reasonCounts),
              backgroundColor: [
                "#FF6B6B",
                "#4ECDC4",
                "#FFD93D",
                "#6C5CE7",
                "#00B894",
                "#0984E3",
              ],
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: "Downtime Reasons",
              font: { size: 16, weight: "bold" },
              padding: { top: 10, bottom: 20 },
            },
            legend: {
              display: true,
              position: "right",
              labels: {
                boxWidth: 15,
                padding: 15,
                font: { size: 10 },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  const total = Object.values(reasonCounts).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
            datalabels: {
              color: "#fff",
              font: { weight: "bold", size: 12 },
              formatter: (value: number) => {
                const total = Object.values(reasonCounts).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
              },
            },
          },
        },
        plugins: [ChartDataLabels],
      });

      await chart.update();

      const chartImg = canvas.toDataURL("image/png");

      const chartY = (doc as any).lastAutoTable.finalY + 10;
      doc.addImage(chartImg, "PNG", 14, chartY, 160, 120);

      chart.destroy();
      canvas.remove();
    }

    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(
      `Generated by Automated System on ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 10
    );

    doc.save("downtime_report.pdf");
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md px-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex gap-3 items-center">
          Tablet Machine Dashboard
          <Link to="/">
            <MdTabletMac className="text-gray-600 w-6 h-6" />
          </Link>
        </h1>
        <img
          src={Logo}
          alt="Logo"
          className="h-20 w-auto object-contain cursor-pointer"
          onClick={handleLogout}
          title="Click to logout"
        />
      </div>

      <div className="flex justify-end gap-4 pb-5">
        <button
          onClick={handlePrintReport}
          className="bg-secondary text-white rounded-lg p-3 font-bold cursor-pointer hover:bg-white hover:text-secondary hover:border-secondary "
        >
          Print Report
        </button>

        <button
          onClick={() => setShowForm(true)}
          className="bg-primary/90 text-white rounded-lg p-3 font-bold cursor-pointer hover:bg-primary"
        >
          Add Machine
        </button>
      </div>

      {/* Square Grid */}
      {machines.length === 0 ? (
        <div className="flex items-center justify-center w-full h-64 bg-white/60 rounded-xl shadow-md mt-6">
          <p className="text-gray-600 font-semibold text-lg">
            🚫 There is no Downtimes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {machines.map((machine) => (
            <div
              key={machine._id}
              className={`aspect-square rounded-xl shadow-lg flex flex-col items-center justify-between p-4 text-white ${getStatusColor(
                machine.status
              )}`}
            >
              {/* Top: Machine Info */}
              <div className="flex flex-col items-center">
                {getIcon(machine.status)}
                <div className="text-lg font-bold mt-2">
                  {machine.machineName}
                </div>
                <div className="text-lg font-bold mt-2">{machine.section}</div>
                <div className="text-lg font-bold mt-2">{machine.line}</div>
                <div className="text-sm opacity-90">
                  {machine.status.charAt(0).toUpperCase() +
                    machine.status.slice(1)}
                </div>
                <div className="text-xs opacity-80">
                  Downtime: {calculateDowntime(machine)}
                </div>
              </div>

              <div className="flex gap-3 w-full">
                {machine.status === "down" && (
                  <button
                    onClick={() => handleArrivedClick(machine._id)}
                    className="flex-1 bg-black/30 text-white font-semibold py-2 rounded-lg shadow cursor-pointer hover:bg-black/40"
                  >
                    Arrived
                  </button>
                )}

                {machine.status === "arrived" && (
                  <button
                    onClick={() => handleRunningClick(machine._id)}
                    className="flex-1 bg-green-700 text-white font-semibold py-2 rounded-lg shadow cursor-pointer hover:bg-green-800"
                  >
                    Mark as Running
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] relative h-full">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black cursor-pointer"
            >
              ✕
            </button>
            <AddMachine />
          </div>
        </div>
      )}

      {showLogin && (
        <MechanicLoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default TabletDashboard;
