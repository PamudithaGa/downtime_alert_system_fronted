import React, {
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react";
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
  phone: string;
}

const MySwal = withReactContent(Swal);
// const sections = Array.from({ length: 6 }, (_, i) => `Section${i + 1}`);
// const lines = Array.from({ length: 9 }, (_, i) => `Line${i + 1}`);
const sections = Array.from({ length: 6 }, (_, i) => `Section${i + 1}`);
const lines = Array.from({ length: 9 }, (_, i) => `Line${i + 1}`);

const Register: React.FC = () => {
  // const [formData, setFormData] = useState<FormData>({
  //   name: "",
  //   email: "",
  //   password: "",
  //   department: "technical",
  //   epf: "",
  //   role: "",
  //   phone: "",
  // });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    department: "engineering", // default to engineering
    epf: "",
    role: "",
    phone: "",
    section: "",
    line: "",
  });

  // const [availableLines, setAvailableLines] = useState<string[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [message, setMessage] = useState<string>("");
  const [availableLines, setAvailableLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // useEffect(() => {
  //   if (formData.department === "production") {
  //     // Show sections and require line selection too
  //     setAvailableLines(lines);
  //     setFormData((prev) => ({ ...prev, line: "" }));
  //   } else if (formData.department === "engineering") {
  //     // Engineering department also has lines, but no sections (if that's your rule)
  //     setAvailableLines(lines);
  //     setFormData((prev) => ({ ...prev, line: "" }));
  //   } else {
  //     // Other departments don't need section/line
  //     setAvailableLines([]);
  //     setFormData((prev) => ({ ...prev, section: "", line: "" }));
  //   }
  // }, [formData.department]);

  useEffect(() => {
    // Engineering + Production have sections & lines in this app
    if (
      formData.department === "engineering" ||
      formData.department === "production"
    ) {
      setAvailableLines(lines);
      setFormData((prev) => ({
        ...prev,
        section: prev.section ?? "",
        line: prev.line ?? "",
      }));
    } else {
      setAvailableLines([]);
      setFormData((prev) => ({ ...prev, section: "", line: "" }));
    }
  }, [formData.department]);

  // const handleChange = (
  //   e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setMessage("");

  //   // Trim spaces
  //   const trimmedData: FormData = {
  //     ...formData,
  //     name: formData.name.trim(),
  //     email: formData.email.trim(),
  //     password: formData.password.trim(),
  //     epf: formData.epf.trim(),
  //     role: formData.role.trim(),
  //     section: formData.section?.trim(),
  //     line: formData.line?.trim(),
  //   };

  //   // Role validation
  //   if (!departmentRoles[trimmedData.department].includes(trimmedData.role)) {
  //     setMessage(`Invalid role for ${trimmedData.department}`);
  //     setLoading(false);
  //     return;
  //   }

  //   // Team leader must select section and line
  //   if (
  //     trimmedData.role === "team leader" &&
  //     trimmedData.department === "production"
  //   ) {
  //     if (!trimmedData.section || !trimmedData.line) {
  //       setMessage("Team leader must select a Section and Line.");
  //       setLoading(false);
  //       return;
  //     }
  //   }

  //   try {
  //     const res = await axios.post(
  //       "http://localhost:5000/api/auth/register",
  //       trimmedData
  //     );
  //     setMessage(res.data.message);

  //     // Reset form
  //     setFormData({
  //       name: "",
  //       email: "",
  //       password: "",
  //       department: "technical",
  //       epf: "",
  //       role: "",
  //       phone: "",
  //     });

  //     MySwal.fire({
  //       icon: "success",
  //       title: "Registration Successful",
  //       text: res.data.message,
  //     });
  //   } catch (err: any) {
  //     setMessage(err.response?.data?.message || "Something went wrong.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const trimmed = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      epf: formData.epf.trim(),
      role: formData.role.trim(),
      section: formData.section?.trim(),
      line: formData.line?.trim(),
      department: formData.department.trim(),
      phone: formData.phone.trim(),
    };

    // validate role belongs to department
    if (!DEPARTMENT_ROLES[trimmed.department]?.includes(trimmed.role)) {
      setMessage(`Invalid role for ${trimmed.department}`);
      setLoading(false);
      return;
    }

    // Require section+line: Engineering->Mechanic, Production->Team Leader
    const needsSectionLine =
      (trimmed.department === "engineering" && trimmed.role === "Mechanic") ||
      (trimmed.department === "production" && trimmed.role === "Team Leader");

    if (needsSectionLine && (!trimmed.section || !trimmed.line)) {
      setMessage("Please select both Section and Line.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        trimmed
      );
      setMessage(res.data.message);
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "engineering",
        epf: "",
        role: "",
        phone: "",
        section: "",
        line: "",
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

  // const departmentRoles: Record<string, string[]> = {
  //   production: [
  //     "Team Leader",
  //     "Group Leader",
  //     "Value stream executive",
  //     "Value stream manager",
  //   ],
  //   technical: ["Staff member", "Executive"],
  //   engineering: ["mechanic", "Executive"],
  //   quality: ["Staff member", "Executive"],
  //   cutting: ["Staff member", "Executive"],
  //   industrialeng: ["Staff member", "Executive"],
  //   subassembly: [
  //     "Team Leader",
  //     "Group Leader",
  //     "Value stream executive",
  //     "Head of Department",
  //   ],
  // };

  const DEPARTMENT_ROLES: Record<string, string[]> = {
    engineering: ["Mechanic", "Executive"],
    production: [
      "Team Leader",
      "Group Leader",
      "Value stream executive",
      "Value stream manager",
    ],
    technical: ["Staff member", "Executive"],
    quality: ["Staff member", "Executive"],
    cutting: ["Staff member", "Executive"],
    industrialeng: ["Staff member", "Executive"],
    subassembly: [
      "Team Leader",
      "Group Leader",
      "Value stream executive",
      "Head of Department",
    ],
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
          {/* Name */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60"
            />
          </div>

          {/* Email */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60"
            />
          </div>

          {/* Phone Number */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <input
              type="text"
              name="phone"
              placeholder="+94XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="^\+94\d{9}$"
              maxLength={12}
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60"
            />
          </div>

          {/* EPF */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <input
              type="text"
              name="epf"
              placeholder="EPF Number"
              value={formData.epf}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black placeholder-black/60"
            />
          </div>

          {/* Department */}
          <div className="flex items-center bg-white/30  rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black"
            >
              <option value="technical">Technical</option>
              <option value="quality">Quality</option>
              <option value="engineering">Engineering</option>
              <option value="industrialeng">Industrial Engneering</option>
              <option value="cutting">Cutting</option>
              <option value="subassembly">Sub Assembly Unit</option>
              <option value="production">Production</option>
            </select>
          </div>

          {/* Section & Line for Production */}
          {/* {formData.department === "production" && (
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

          {formData.department === "engineering" && (
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
          )} */}
          {(formData.department === "engineering" ||
            formData.department === "production") && (
            <>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required={
                  (formData.department === "engineering" &&
                    formData.role === "Mechanic") ||
                  (formData.department === "production" &&
                    formData.role === "Team Leader")
                }
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
                required={
                  (formData.department === "engineering" &&
                    formData.role === "Mechanic") ||
                  (formData.department === "production" &&
                    formData.role === "Team Leader")
                }
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

          {/* Role */}
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 border border-transparent hover:border-primary transition-colors duration-200">
            {/* <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black"
            >
              <option value="">Select Role</option>
              {departmentRoles[formData.department].map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select> */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="bg-transparent flex-1 outline-none text-black"
            >
              <option value="">Select Role</option>
              {DEPARTMENT_ROLES[formData.department].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/80 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {message && (
          <p className="text-center text-sm text-red-500 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
