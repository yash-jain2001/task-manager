import { Link, useNavigate, useLocation } from "react-router-dom";
import { FolderKanban, LogOut, ChevronDown } from "lucide-react";

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const roleColor = user.role === "ADMIN"
    ? "from-violet-500 to-indigo-500"
    : "from-cyan-500 to-blue-500";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#080b14]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <span className="text-[10px] font-black text-white tracking-tighter">TF</span>
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white">
                Task<span className="text-indigo-400">Flow</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/projects") || location.pathname.startsWith("/projects/")
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User pill */}
            <div className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
              <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[11px] font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                <p className={`text-[10px] leading-none mt-0.5 font-medium ${user.role === "ADMIN" ? "text-violet-400" : "text-cyan-400"}`}>
                  {user.role}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
