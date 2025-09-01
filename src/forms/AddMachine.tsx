//forms/AddMachine.tsx
import React, { useState } from "react";

const statusOptions = ["down", "arrived", "running"];

const AddMachine: React.FC = () => {
  const [form, setForm] = useState({
    machineId: "",
    machineName: "",
    machineOwner: "",
    machineType: "",
    section: "",
    line: "",
    status: "running",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.machineId.trim()) newErrors.machineId = "Machine ID is required";
    if (!form.machineName.trim())
      newErrors.machineName = "Machine Name is required";
    if (!form.machineType.trim())
      newErrors.machineType = "Machine Type is required";
    if (!statusOptions.includes(form.status))
      newErrors.status = "Invalid status selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch("http://localhost:5000/api/machines/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        // Try to parse error message from backend
        const errorData = await response.json();
        alert("Error: " + (errorData.message || "Failed to add machine"));
        return;
      }

      alert("Machine added successfully!");
      setForm({
        machineId: "",
        machineName: "",
        machineOwner: "",
        machineType: "",
        section: "",
        line: "",
        status: "down",
      });
      setErrors({});
    } catch (error) {
      alert("Network error: Could not reach server");
      console.error("Add machine error:", error);
    }
  };

  return (
    <div className=" bg-white p-6 rounded-xl shadow-lg h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Machine</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Machine ID */}
        <div>
          <label htmlFor="machineId" className="block font-semibold mb-1">
            Machine ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="machineId"
            id="machineId"
            value={form.machineId}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              errors.machineId
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            placeholder="e.g. M001"
          />
          {errors.machineId && (
            <p className="text-red-500 text-sm mt-1">{errors.machineId}</p>
          )}
        </div>

        {/* Machine Name */}
        <div>
          <label htmlFor="machineName" className="block font-semibold mb-1">
            Machine Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="machineName"
            id="machineName"
            value={form.machineName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              errors.machineName
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            placeholder="e.g. Lathe 2000"
          />
          {errors.machineName && (
            <p className="text-red-500 text-sm mt-1">{errors.machineName}</p>
          )}
        </div>

        {/* Machine Owner */}
        <div>
          <label htmlFor="machineOwner" className="block font-semibold mb-1">
            Machine Owner
          </label>
          <input
            type="text"
            name="machineOwner"
            id="machineOwner"
            value={form.machineOwner}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Optional"
          />
        </div>

        {/* Machine Type */}
        <div>
          <label htmlFor="machineType" className="block font-semibold mb-1">
            Machine Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="machineType"
            id="machineType"
            value={form.machineType}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              errors.machineType
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            placeholder="e.g. CNC, Lathe"
          />
          {errors.machineType && (
            <p className="text-red-500 text-sm mt-1">{errors.machineType}</p>
          )}
        </div>

        {/* Section */}
        <div>
          <label htmlFor="section" className="block font-semibold mb-1">
            Section
          </label>
          <input
            type="text"
            name="section"
            id="section"
            value={form.section}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Optional"
          />
        </div>

        {/* Line */}
        <div>
          <label htmlFor="line" className="block font-semibold mb-1">
            Line
          </label>
          <input
            type="text"
            name="line"
            id="line"
            value={form.line}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Optional"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block font-semibold mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            id="status"
            value={form.status}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              errors.status
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-semibold py-3 rounded hover:bg-primary/80 transition cursor-pointer"
        >
          Add Machine
        </button>
      </form>
    </div>
  );
};

export default AddMachine;
