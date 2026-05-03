import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Calendar, Trash2, X } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "TODO" });
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        API.get(`/projects`), // ideally we'd have a GET /projects/:id endpoint, but we can filter from all for now
        API.get(`/tasks/project/${id}`)
      ]);
      const currentProject = projectRes.data.find(p => p._id === id);
      setProject(currentProject);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", { ...newTask, projectId: id });
      setIsModalOpen(false);
      setNewTask({ title: "", description: "", status: "TODO" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchData(); // Revert on failure
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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!project) return <div className="text-center py-20 text-slate-400">Project not found.</div>;

  const columns = [
    { id: "TODO", title: "To Do", color: "bg-slate-800/50 border-slate-700" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-900/20 border-blue-900/50" },
    { id: "DONE", title: "Done", color: "bg-green-900/20 border-green-900/50" }
  ];

  return (
    <div className="p-4 max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <Link to="/projects" className="text-slate-400 hover:text-white flex items-center gap-1 mb-2 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-400 mt-1">{project.description}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </button>
      </header>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden flex-grow pb-4">
        {columns.map(column => (
          <div key={column.id} className={`flex flex-col rounded-2xl border ${column.color} overflow-hidden h-full`}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <h2 className="font-bold">{column.title}</h2>
              <span className="bg-slate-900 text-xs py-1 px-2 rounded-full font-medium">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
              <AnimatePresence>
                {tasks.filter(t => t.status === column.id).map(task => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-800 rounded-xl p-4 border border-white/5 shadow-lg group hover:border-white/20 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold leading-tight">{task.title}</h3>
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{task.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      
                      <select 
                        className="bg-slate-900 border border-white/10 rounded-md text-xs py-1 px-2 text-slate-300 outline-none hover:border-blue-500 transition-colors"
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
              {tasks.filter(t => t.status === column.id).length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-xl py-8">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Design homepage layout"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                  <textarea
                    rows="3"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Add more details about this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium text-white transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Save Task
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
