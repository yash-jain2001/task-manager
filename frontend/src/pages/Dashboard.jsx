import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Folders, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const statusConfig = {
  TODO: { label: "To Do", className: "badge-todo" },
  IN_PROGRESS: { label: "In Progress", className: "badge-progress" },
  DONE: { label: "Done", className: "badge-done" },
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/dashboard/stats");
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "To Do",
      value: stats?.todoTasks || 0,
      icon: <AlertCircle className="h-5 w-5" />,
      gradient: "from-indigo-500/20 to-indigo-600/10",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-400",
      border: "border-indigo-500/10",
    },
    {
      label: "In Progress",
      value: stats?.inProgressTasks || 0,
      icon: <Clock className="h-5 w-5" />,
      gradient: "from-amber-500/20 to-amber-600/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      border: "border-amber-500/10",
    },
    {
      label: "Completed",
      value: stats?.doneTasks || 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      border: "border-emerald-500/10",
    },
    {
      label: "Projects",
      value: stats?.projectsCount || 0,
      icon: <Folders className="h-5 w-5" />,
      gradient: "from-violet-500/20 to-violet-600/10",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
      border: "border-violet-500/10",
    },
  ];

  const total = (stats?.todoTasks || 0) + (stats?.inProgressTasks || 0) + (stats?.doneTasks || 0);
  const donePercent = total > 0 ? Math.round(((stats?.doneTasks || 0) / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} p-5`}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            {stats?.recentTasks?.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {stats.recentTasks.map((task, i) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        task.status === "DONE" ? "bg-emerald-400" :
                        task.status === "IN_PROGRESS" ? "bg-amber-400" : "bg-indigo-400"
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 truncate">{task.project?.name}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${statusConfig[task.status]?.className || "badge-todo"}`}>
                      {statusConfig[task.status]?.label || task.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">No tasks yet</p>
                <p className="text-xs text-slate-600 mt-1">Tasks will appear here once created</p>
              </div>
            )}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white">Progress</h2>
          <div className="glass rounded-2xl p-5 space-y-5">
            {/* Circular progress */}
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="url(#grad)"
                    strokeWidth="2.5"
                    strokeDasharray={`${donePercent} ${100 - donePercent}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{donePercent}%</span>
                  <span className="text-[10px] text-slate-500">done</span>
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-3">
              {[
                { label: "To Do", value: stats?.todoTasks || 0, color: "bg-indigo-500" },
                { label: "In Progress", value: stats?.inProgressTasks || 0, color: "bg-amber-500" },
                { label: "Done", value: stats?.doneTasks || 0, color: "bg-emerald-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-slate-400 text-xs">{item.label}</span>
                  </div>
                  <span className="text-white font-semibold text-xs">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-xs text-slate-400">{total} total tasks tracked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
