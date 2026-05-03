import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut, User } from "lucide-react";

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-500">
            <LayoutDashboard className="h-6 w-6" />
            <span>TaskManager</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/projects" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 ring-1 ring-white/10">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-md font-bold uppercase">
              {user.role}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
