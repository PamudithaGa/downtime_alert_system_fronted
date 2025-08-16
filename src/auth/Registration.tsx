import React, { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import axios from "axios";
import Logo from "../assets/logo/Logo_of_MAS_Holdings.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface FormData {
  name: string;
  email: string;
  password: string;
  department: string;
  epf: string;
  role: string;
  section?: string;
  line?: string;
}
const MySwal = withReactContent(Swal);
const sections = Array.from({ length: 6 }, (_, i) => `Section${i + 1}`);
const lines = Array.from({ length: 9 }, (_, i) => `Line${i + 1}`);

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    department: "technical",
    epf: "",
    role: "",
  });

  const [availableLines, setAvailableLines] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (formData.department === "production" && formData.section) {
      setAvailableLines(lines);
      setFormData((prev) => ({ ...prev, line: "" }));
    } else {
      setAvailableLines([]);
      setFormData((prev) => ({ ...prev, section: "", line: "" }));
    }
  }, [formData.department, formData.section]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      setMessage(res.data.message);
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "technical",
        epf: "",
        role: "",
      });
      MySwal.fire({
        icon: "success",
        title: "Registration Successful",
        text: res.data.message,
      });
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r bg-secondary">
      <div className="backdrop-blur-lg rounded-2xl shadow-lg p-8 w-[400px] h-auto flex items-center flex-col bg-white/20">
        <div className="w-[200px] mb-6">
          <img src={Logo} alt="MAS Holdings Logo" />
        </div>
        <h2 className="text-center text-lg font-semibold text-white mb-6">
          Register a User Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            />
          </div>
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            />
          </div>{" "}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            />
          </div>
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="text"
              name="epf"
              placeholder="EPF Number"
              value={formData.epf}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            />
          </div>
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="text"
              name="role"
              placeholder="Role (e.g., employee, team leader)"
              value={formData.role}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            />
          </div>
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60 hover:border-primary"
            >
              <option value="technical">Technical</option>
              <option value="quality">Quality</option>
              <option value="industrialeng">Industrial Eng</option>
              <option value="cutting">Cutting</option>
              <option value="subassembly">Subassembly</option>
              <option value="production">Production</option>
            </select>
          </div>
          {formData.department === "production" && (
            <>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>

              <select
                name="line"
                value={formData.line}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Line</option>
                {availableLines.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/80 cursor-pointer transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
