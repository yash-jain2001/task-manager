import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, User, X, ArrowRight, Calendar } from "lucide-react";

const projectColors = [
  "from-indigo-500/20 to-indigo-600/5 border-indigo-500/15",
  "from-violet-500/20 to-violet-600/5 border-violet-500/15",
  "from-cyan-500/20 to-cyan-600/5 border-cyan-500/15",
  "from-emerald-500/20 to-emerald-600/5 border-emerald-500/15",
  "from-rose-500/20 to-rose-600/5 border-rose-500/15",
  "from-amber-500/20 to-amber-600/5 border-amber-500/15",
];

const iconColors = [
  { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  { bg: "bg-violet-500/20", text: "text-violet-400" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  { bg: "bg-rose-500/20", text: "text-rose-400" },
  { bg: "bg-amber-500/20", text: "text-amber-400" },
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post("/projects", newProject);
      setIsModalOpen(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-1">Workspace</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {projects.map((project, i) => {
              const colorClass = projectColors[i % projectColors.length];
              const iconColor = iconColors[i % iconColors.length];
              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`group relative bg-gradient-to-br ${colorClass} border rounded-2xl overflow-hidden cursor-pointer`}
                >
                  <Link to={`/projects/${project._id}`} className="block p-6 h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`h-11 w-11 rounded-xl ${iconColor.bg} ${iconColor.text} flex items-center justify-center`}>
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-black/20 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                      {project.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-500">{project.owner?.name || "Unknown"}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:gap-2 transition-all">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-28 glass rounded-2xl border border-dashed border-white/[0.08]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1.5">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first project to get started.</p>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
          )}
        </motion.div>
      )}

      {/* Modal */}
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
                <h2 className="text-xl font-bold text-white">New Project</h2>
                <p className="text-slate-500 text-sm mt-1">Add a new project to your workspace</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Website Redesign"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500/60 transition-all"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description <span className="text-slate-600 normal-case">(optional)</span></label>
                  <textarea
                    rows="3"
                    placeholder="What is this project about?"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-indigo-500/60 transition-all resize-none"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
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
                    Create Project
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

export default Projects;
