import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="space-y-8 p-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/projects" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition-all">
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<AlertCircle className="text-blue-500" />} 
          label="Todo" 
          value={stats?.todoTasks || 0} 
          color="bg-blue-500/10" 
        />
        <StatCard 
          icon={<Clock className="text-amber-500" />} 
          label="In Progress" 
          value={stats?.inProgressTasks || 0} 
          color="bg-amber-500/10" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-500" />} 
          label="Completed" 
          value={stats?.doneTasks || 0} 
          color="bg-green-500/10" 
        />
        <StatCard 
          icon={<Plus className="text-purple-500" />} 
          label="Projects" 
          value={stats?.projectsCount || 0} 
          color="bg-purple-500/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Tasks</h2>
            <Link to="/projects" className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
            {stats?.recentTasks?.length > 0 ? (
              <div className="divide-y divide-white/5">
                {stats.recentTasks.map((task) => (
                  <div key={task._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-slate-400">{task.project?.name}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      task.status === "DONE" ? "bg-green-500/20 text-green-500" :
                      task.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-500" :
                      "bg-blue-500/20 text-blue-500"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                No tasks assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips or Something */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
            <p className="text-blue-100 mb-6">Assign tasks to your team members and track progress in real-time.</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50">
              Invite Members
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
            <FolderKanban size={160} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-lg"
  >
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const FolderKanban = ({ size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    <path d="M8 10v4"/>
    <path d="M12 10v2"/>
    <path d="M16 10v6"/>
  </svg>
);

export default Dashboard;
