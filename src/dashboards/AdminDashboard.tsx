import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Logo from "../assets/logo/mas-holdings-logo-seeklogo.png";
import { Link, useNavigate } from "react-router-dom";
import AddMachine from "../forms/AddMachine";

interface MachineLog {
  status: string;
  time?: string;
  m_ArrivalTime?: string;
  breakdownEndTime?: string;
  errorDescription?: string;
}

interface Machine {
  _id: string;
  machineId: string;
  machineName: string;
  status: string;
  logs: MachineLog[];
}

const calculateDowntime = (machine: Machine) => {
  if (machine.status === "running") return "As soon as possible";
  if (!machine.logs || machine.logs.length === 0) return "N/A";

  const now = new Date().getTime();
  const downLog = [...machine.logs]
    .reverse()
    .find((log) => log.status === "down");
  if (!downLog || !downLog.time) return "N/A";

  const startTimeMs = new Date(downLog.time).getTime();
  const durationMs = now - startTimeMs;

  const mins = Math.floor(durationMs / 60000);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
};

const calculateEfficiencyLoss = (machine: Machine, empCount = 20) => {
  if (!machine.logs || machine.logs.length === 0) return 0;
  const downLog = [...machine.logs]
    .reverse()
    .find((log) => log.status === "down");
  if (!downLog || !downLog.time) return 0;

  const durationMs = new Date().getTime() - new Date(downLog.time).getTime();
  const downtimeMins = Math.floor(durationMs / 60000);
  return ((downtimeMins * empCount * 0.6) / 60).toFixed(2);
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [stats, setStats] = useState({
    totalMachines: 0,
    downMachines: 0,
    totalEfficiencyLoss: 0,
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/machines");
        setMachines(res.data);

        const totalMachines = res.data.length;
        const downMachines = res.data.filter(
          (m: Machine) => m.status === "down"
        ).length;
        const totalEfficiencyLoss = res.data.reduce(
          (acc: number, m: Machine) => acc + Number(calculateEfficiencyLoss(m)),
          0
        );

        setStats({ totalMachines, downMachines, totalEfficiencyLoss });
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };

    fetchMachines();
  }, []);

  const COLORS = ["#4caf50", "#f44336", "#ff9800"];
  const statusCount = machines.reduce((acc: any, m: Machine) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(statusCount).map((key) => ({
    name: key,
    value: statusCount[key],
  }));

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
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddMachine = () => {
    // Call your API to add machine here
    console.log("Machine added!");
    handleClose();
  };
  return (
    // <div style={{ padding: 20 }}>
    //   <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-md">
    //     <h1 className="lg:text-3xl lg:block hidden text-2xl font-extrabold text-gray-800 tracking-tight">
    //       Admin Dashboard
    //     </h1>
    //     <h1 className="lg:hidden block text-2xl font-extrabold text-gray-800 tracking-tight">
    //       Downtime Alerts
    //     </h1>
    //     <div>
    //       <img
    //         src={Logo}
    //         alt="Logo"
    //         onClick={handleLogout}
    //         className="h-14 w-auto object-contain"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <div className="grid grid-cols-2 gap-4 mb-6">
    //       {/* Trigger Add Machine */}
    //       <Button variant="contained" color="primary" onClick={handleOpen}>
    //         Add Machine
    //       </Button>

    //       {/* Add Member Link */}
    //       <Button
    //         variant="outlined"
    //         color="secondary"
    //         component={Link}
    //         to="/registration"
    //       >
    //         Add Member
    //       </Button>
    //     </div>

    //     {/* Render AddMachine component */}
    //     {open && <AddMachine open={close} onClose={handleClose} />}
    //   </div>

    //   <div className="grid grid-cols-2 gap-6">
    //     <div>
    //       {/* Dashboard Cards */}
    //       <Grid container spacing={3}>
    //         <Grid item xs={12} sm={6} md={3}>
    //           <Card sx={{ background: "#4caf50", color: "#fff" }}>
    //             <CardContent>
    //               <Typography variant="h6">Total Machines</Typography>
    //               <Typography variant="h4">{stats.totalMachines}</Typography>
    //             </CardContent>
    //           </Card>
    //         </Grid>

    //         <Grid item xs={12} sm={6} md={3}>
    //           <Card sx={{ background: "#f44336", color: "#fff" }}>
    //             <CardContent>
    //               <Typography variant="h6">Down Machines</Typography>
    //               <Typography variant="h4">{stats.downMachines}</Typography>
    //             </CardContent>
    //           </Card>
    //         </Grid>

    //         <Grid item xs={12} sm={6} md={3}>
    //           <Card sx={{ background: "#2196f3", color: "#fff" }}>
    //             <CardContent>
    //               <Typography variant="h6">Efficiency Loss (hrs)</Typography>
    //               <Typography variant="h4">
    //                 {stats.totalEfficiencyLoss}
    //               </Typography>
    //             </CardContent>
    //           </Card>
    //         </Grid>
    //       </Grid>

    //       {/* Pie Chart */}
    //       <div style={{ marginTop: 30 }}>
    //         <Typography variant="h5" gutterBottom>
    //           Machine Status Distribution
    //         </Typography>
    //         <PieChart width={400} height={300}>
    //           <Pie
    //             data={pieData}
    //             dataKey="value"
    //             nameKey="name"
    //             cx="50%"
    //             cy="50%"
    //             outerRadius={100}
    //             label
    //           >
    //             {pieData.map((entry, index) => (
    //               <Cell
    //                 key={`cell-${index}`}
    //                 fill={COLORS[index % COLORS.length]}
    //               />
    //             ))}
    //           </Pie>
    //           <Tooltip />
    //           <Legend />
    //         </PieChart>
    //       </div>
    //     </div>
    //     <div>
    //       {/* Machine Table */}
    //       <TableContainer component={Paper} sx={{ marginTop: 40 }}>
    //         <Table>
    //           <TableHead>
    //             <TableRow>
    //               <TableCell>Machine ID</TableCell>
    //               <TableCell>Name</TableCell>
    //               <TableCell>Status</TableCell>
    //               <TableCell>Last Issue</TableCell>
    //               <TableCell>Downtime</TableCell>
    //               <TableCell>Efficiency Loss</TableCell>
    //             </TableRow>
    //           </TableHead>
    //           <TableBody>
    //             {machines.map((m) => (
    //               <TableRow key={m._id}>
    //                 <TableCell>{m.machineId}</TableCell>
    //                 <TableCell>{m.machineName}</TableCell>
    //                 <TableCell>{m.status}</TableCell>
    //                 <TableCell>
    //                   {m.logs[0]?.errorDescription || "N/A"}
    //                 </TableCell>
    //                 <TableCell>{calculateDowntime(m)}</TableCell>
    //                 <TableCell>{calculateEfficiencyLoss(m)}</TableCell>
    //               </TableRow>
    //             ))}
    //           </TableBody>
    //         </Table>
    //       </TableContainer>
    //     </div>
    //   </div>
    // </div>
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  {/* Top Bar */}
  <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg">
    <h1 className="hidden lg:block text-3xl font-extrabold text-gray-800 tracking-tight">
      Admin Dashboard
    </h1>
    <h1 className="block lg:hidden text-2xl font-extrabold text-gray-800 tracking-tight">
      Downtime Alerts
    </h1>
    <img
      src={Logo}
      alt="Logo"
      onClick={handleLogout}
      className="h-14 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
    />
  </div>

  {/* Action Buttons */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    <Button
      variant="contained"
      color="primary"
      onClick={handleOpen}
      className="!rounded-xl !py-3 !text-lg shadow-md hover:shadow-xl transition-all"
    >
      ➕ Add Machine
    </Button>

    <Button
      variant="outlined"
      color="secondary"
      component={Link}
      to="/registration"
      className="!rounded-xl !py-3 !text-lg shadow-md hover:shadow-xl transition-all"
    >
      👤 Add Member
    </Button>
  </div>

  {/* Add Machine Modal */}
  {open && <AddMachine open={open} onClose={handleClose} />}

  {/* Dashboard Layout */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Left Section */}
    <div>
      {/* Stat Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "#4caf50", color: "#fff", borderRadius: "16px" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Total Machines
              </Typography>
              <Typography variant="h4">{stats.totalMachines}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "#f44336", color: "#fff", borderRadius: "16px" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Down Machines
              </Typography>
              <Typography variant="h4">{stats.downMachines}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: "#2196f3", color: "#fff", borderRadius: "16px" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Efficiency Loss (hrs)
              </Typography>
              <Typography variant="h4">{stats.totalEfficiencyLoss}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pie Chart */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
        <Typography variant="h5" gutterBottom className="font-bold text-gray-700">
          Machine Status Distribution
        </Typography>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>

    {/* Right Section - Table */}
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <Typography variant="h6" className="font-bold text-gray-700 mb-4">
          Machines Overview
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: "16px", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ background: "#f9fafb" }}>
              <TableRow>
                <TableCell className="font-semibold">Machine ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Last Issue</TableCell>
                <TableCell className="font-semibold">Downtime</TableCell>
                <TableCell className="font-semibold">Efficiency Loss</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machines.map((m) => (
                <TableRow
                  key={m._id}
                  hover
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell>{m.machineId}</TableCell>
                  <TableCell>{m.machineName}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  <TableCell>
                    {m.logs[0]?.errorDescription || "N/A"}
                  </TableCell>
                  <TableCell>{calculateDowntime(m)}</TableCell>
                  <TableCell>{calculateEfficiencyLoss(m)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  </div>
</div>

  );
};

export default AdminDashboard;
