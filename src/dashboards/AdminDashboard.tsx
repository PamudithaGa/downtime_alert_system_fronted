import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Logo from "../assets/logo/Logo_of_MAS_Holdings.png";
// import axios from "axios";
const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ]);

  const [iotData] = useState([
    { id: 1, device: "Temperature Sensor", status: "Online", value: "23°C" },
    { id: 2, device: "Humidity Sensor", status: "Offline", value: "-" },
  ]);

  const [chats] = useState([
    { id: 1, user: "Alice", message: "Device 1 is overheating!" },
    { id: 2, user: "Bob", message: "Checked device 2, all good." },
  ]);

  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const nextId = users.length ? users[users.length - 1].id + 1 : 1;
    setUsers([...users, { id: nextId, ...newUser }]);
    setNewUser({ name: "", email: "" }); // reset form
  };

  // const navigate = useNavigate();
  // const handleLogout = async () => {
  //   try {
  //     // Call backend logout API
  //     await axios.post("https://downtimealertsystembackend-production.up.railway.app/api/auth/logout");

  //     // Clear JWT
  //     localStorage.removeItem("token");

  //     // Redirect to login
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   }
  // };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Users Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add User
          </button>
        </div>

        {/* Add User Form */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="p-2 rounded border flex-1"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="p-2 rounded border flex-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 bg-white rounded shadow">
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IoT Devices Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IoT Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {iotData.map((device) => (
            <div key={device.id} className="p-4 bg-white rounded shadow">
              <p className="font-semibold">{device.device}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    device.status === "Online" ? "text-green-500" : "text-red-500"
                  }
                >
                  {device.status}
                </span>
              </p>
              <p>Value: {device.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chats Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <div className="space-y-2">
          {chats.map((chat) => (
            <div key={chat.id} className="p-4 bg-white rounded shadow">
              <p className="font-semibold">{chat.user}</p>
              <p>{chat.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
