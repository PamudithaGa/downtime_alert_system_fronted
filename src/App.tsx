import React, { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Logo from "./assets/logo/Logo_of_MAS_Holdings.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Login: React.FC = () => {
  const [epf, setEpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epf, password }),
      });

      const data = await res.json();

      if (res.ok) {
        MySwal.fire({
          icon: "success",
          title: "Login Success!",
          text: `Welcome back, ${data.user.name}!`,
          timer: 2000,
          showConfirmButton: false,
        });
        console.log("Login Success:", data);
        if (remember) localStorage.setItem("token", data.token);
        else sessionStorage.setItem("token", data.token);
        // Redirect or update UI here
      } else {
        MySwal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Network Error",
        text: "Try again later",
      });
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r bg-secondary">
      <div className="backdrop-blur-lg rounded-2xl shadow-lg p-8 w-[400px] h-auto flex items-center flex-col bg-white/20">
        <div className="w-[200px] mb-6">
          <img src={Logo} alt="MAS Holdings Logo" />
        </div>

        <h2 className="text-center text-lg font-semibold text-white mb-6">
          Please login to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type="text"
              placeholder="EPF"
              value={epf}
              onChange={(e) => setEpf(e.target.value)}
              className="bg-transparent flex-1 outline-none text-white placeholder-white/70 hover:border-primary"
              required
            />
          </div>

          <div className="flex items-center bg-white/30 rounded-lg px-3 py-2 hover:border-primary border border-transparent transition-colors duration-200">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent flex-1 outline-none text-white placeholder-white/70"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/80"
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          <div className="flex justify-between text-sm text-white/80">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-primary/80 hover:bg-primary text-white py-2 rounded-lg transition cursor-pointer"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
