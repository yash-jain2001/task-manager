import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup", formData);
      // Auto login after signup
      const loginRes = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));
      setUser(loginRes.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl ring-1 ring-white/10"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="mt-2 text-slate-400">Join the team and start tracking</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                className="block w-full rounded-lg bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                className="block w-full rounded-lg bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                placeholder="name@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                className="block w-full rounded-lg bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Role</label>
            <select
              className="mt-1 block w-full rounded-lg bg-slate-800 py-2.5 px-3 text-white ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-all hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
