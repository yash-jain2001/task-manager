import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Calendar, Trash2, X, User, UserPlus } from "lucide-react";

const statusConfig = {
  TODO: {
    label: "To Do",
    colClass: "border-indigo-500/20 bg-indigo-500/[0.03]",
    headerClass: "text-indigo-400",
    badgeClass: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25",
    dotClass: "bg-indigo-400",
    countClass: "bg-indigo-500/20 text-indigo-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    colClass: "border-amber-500/20 bg-amber-500/[0.03]",
    headerClass: "text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    dotClass: "bg-amber-400",
    countClass: "bg-amber-500/20 text-amber-400",
  },
  DONE: {
    label: "Done",
    colClass: "border-emerald-500/20 bg-emerald-500/[0.03]",
    headerClass: "text-emerald-400",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    dotClass: "bg-emerald-400",
    countClass: "bg-emerald-500/20 text-emerald-400",
  },
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "TODO", assignedTo: "" });
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        API.get(`/projects`),
        API.get(`/tasks/project/${id}`),
        API.get(`/users`)
      ]);
      const currentProject = projectRes.data.find(p => p._id === id);
      setProject(currentProject);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", { ...newTask, projectId: id });
      setIsModalOpen(false);
      setNewTask({ title: "", description: "", status: "TODO", assignedTo: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchData();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Project not found.</p>
        <Link to="/projects" className="text-indigo-400 text-sm mt-3 inline-block">← Back to Projects</Link>
      </div>
    );
  }

  const columns = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 mb-2.5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="text-slate-500 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 self-start sm:self-auto cursor-pointer flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden flex-1 pb-4">
        {columns.map((colId) => {
          const config = statusConfig[colId];
          const colTasks = tasks.filter(t => t.status === colId);
          return (
            <div key={colId} className={`flex flex-col rounded-2xl border ${config.colClass} overflow-hidden`}>
              {/* Column header */}
              <div className="px-4 py-3.5 flex items-center justify-between flex-shrink-0 border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                  <h2 className={`text-sm font-semibold ${config.headerClass}`}>{config.label}</h2>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${config.countClass}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence>
                  {colTasks.map(task => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass rounded-xl p-4 border border-white/[0.06] group hover:border-indigo-500/25 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-white leading-snug">{task.title}</h3>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{task.description}</p>
                      )}

                      {/* Meta */}
                      <div className="space-y-1.5 mb-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <User className="h-3 w-3 text-slate-600" />
                          <span>{task.createdBy?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <UserPlus className="h-3 w-3 text-indigo-500" />
                          <span className={task.assignedTo?.name ? "text-indigo-400 font-medium" : "text-slate-600"}>
                            {task.assignedTo?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <select
                          className="bg-transparent border border-white/[0.08] rounded-lg text-[11px] py-1 px-2 text-slate-400 hover:border-indigo-500/50 transition-colors cursor-pointer"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div className="h-full min-h-[120px] flex items-center justify-center border-2 border-dashed border-white/[0.05] rounded-xl">
                    <p className="text-xs text-slate-600">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass rounded-2xl p-7 w-full max-w-md shadow-2xl glow-indigo"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">New Task</h2>
                <p className="text-slate-500 text-sm mt-1">Add a task to <span className="text-indigo-400">{project.name}</span></p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design homepage layout"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500/60 transition-all"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description <span className="text-slate-600 normal-case">(optional)</span></label>
                  <textarea
                    rows="2"
                    placeholder="Add more details..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500/60 transition-all resize-none"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-3 text-sm text-white focus:border-indigo-500/60 transition-all"
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assign To</label>
                    <select
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-3 text-sm text-white focus:border-indigo-500/60 transition-all"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
