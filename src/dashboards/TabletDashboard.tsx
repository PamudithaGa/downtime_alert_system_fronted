import React, { useState } from "react";
import AddMachine from "../forms/AddMachine.tsx";

const TabletDashboard:React.FC = () => {
      const [showAddMachineForm, setShowAddMachineForm] = useState(false);

  return (
    <div>
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
            className="px-4 p-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors cursor-pointer"
          >
            {showAddMachineForm ? "Close Form" : "Add Machine"}
          </button>
        </div>
      </div>
      {showAddMachineForm && (
        <div className="mt-6 z-0 ">
          <AddMachine />
        </div>
      )}
    </div>
  )
}

export default TabletDashboard
