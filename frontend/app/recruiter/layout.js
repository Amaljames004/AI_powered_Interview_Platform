'use client';
import { useState, memo } from "react";
import { useAuth } from '@/context/AuthProvider';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdvancedNotificationDropdown from "@/components/notification/notificationCard";
// import useCurrentUser from "@/utils/useCurrentUser";
import AuthGuard from "@/components/authGuard/authGuard";

const DEFAULT_ICON_SIZE = 20;
const DEFAULT_ICON_STROKE_WIDTH = 2;

const sidebarVariants = {
  open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", opacity: 0, transition: { duration: 0.2 } }
};

const overlayVariants = {
  open: { opacity: 1, backdropFilter: "blur(4px)", transition: { duration: 0.3 } },
  closed: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.2 } }
};

function RecruiterLayout({ children }) {
  // const { user, loading: userLoading } = useCurrentUser();
const userLoading = false;
const user = {
  _id: "689cb17259b396a21587e4b3",
  role: "recruiter",
  name: "skillhire",
  email: "skillhire@gmail.com",
  companyProfile: "689cb47c224a0c87b6344118",
  isActive: true
};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white overflow-hidden font-sans">
        {/* Mobile menu button */}
        <motion.button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
        </motion.button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-40 shadow-xl"
              >
                <div className="p-5 pb-4 flex items-center justify-center border-b border-gray-200">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Recruiter Panel
                  </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                  <SidebarLink href="/recruiter/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Dashboard
                  </SidebarLink>
                  <SidebarLink href="/recruiter/recruitments" icon={<Briefcase size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Manage Recruitments
                  </SidebarLink>
                  <SidebarLink href="/recruiter/applications" icon={<FileText size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Applications
                  </SidebarLink>
                  <SidebarLink href="/recruiter/candidate-pool" icon={<Users size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Candidate Pool
                  </SidebarLink>
                  <SidebarLink href="/recruiter/projects" icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Assign Projects
                  </SidebarLink>
                  <SidebarLink href="/recruiter/profile" icon={<User size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                    Profile
                  </SidebarLink>
                </nav>

                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={logout}
                    className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                    Logout
                  </button>
                </div>
              </motion.aside>

              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                className="fixed inset-0 bg-opacity-50 z-30 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-40"
        >
          <div className="p-3 pb-4 flex items-center justify-center border-b border-gray-200">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Recruiter Panel
            </span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarLink href="/recruiter/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/recruiter/recruitments" icon={<Briefcase size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Manage Recruitments
            </SidebarLink>
            <SidebarLink href="/recruiter/applications" icon={<FileText size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Applications
            </SidebarLink>
            <SidebarLink href="/recruiter/candidate-pool" icon={<Users size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Candidate Pool
            </SidebarLink>
            <SidebarLink href="/recruiter/projects" icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Assign Projects
            </SidebarLink>
            <SidebarLink href="/recruiter/profile" icon={<User size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Profile
            </SidebarLink>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 h-full overflow-hidden">
          <header className="bg-white border-b gap-5 border-gray-200 py-3 px-10 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div className="flex items-center space-x-4">
              {userLoading ? (
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-500 font-medium">Authentication required</p>
              )}
            </div>
            
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

const SidebarLink = memo(function SidebarLink({ href, children, icon }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-all ${
          isActive
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-medium shadow-sm"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span
          className={`mr-3 flex-shrink-0 transition-colors ${
            isActive ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm flex-grow">{children}</span>
      </Link>
    </motion.div>
  );
});

export default RecruiterLayout;
