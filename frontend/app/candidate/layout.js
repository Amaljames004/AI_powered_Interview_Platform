'use client';
import { useEffect, useState, memo } from "react";
import { useAuth } from '@/context/AuthProvider';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,       // for job groups
  FileText,        // for applications
  Video,           // for AI Interviews (video/audio/text)
  ClipboardList,   // for mini-projects
  BarChart2,       // for scores/feedback
  User,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AdvancedNotificationDropdown from "@/components/notification/notificationCard";
// import useCurrentUser from "@/utils/useCurrentUser";
import AuthGuard from "@/components/authGuard/authGuard";

const DEFAULT_ICON_SIZE = 20;
const DEFAULT_ICON_STROKE_WIDTH = 2;

const sidebarVariants = {
  open: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300,
      damping: 30 
    }
  },
  closed: { 
    x: "-100%", 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const overlayVariants = {
  open: { 
    opacity: 1, 
    backdropFilter: "blur(4px)",
    transition: { duration: 0.3 }
  },
  closed: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

function CandidateLayout({ children }) {
  // const { user, loading: userLoading } = useCurrentUser();
  const userLoading = false;
  const { user } = useAuth();


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white overflow-hidden font-sans">
        {/* Mobile menu button */}
        <motion.button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          whileTap={{ scale: 0.95 }}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
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
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-xl font-bold tracking-tight text-black ">
                      SkillHire AI
                    </span>
                  </motion.div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Dashboard
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/public-recrutments" icon={<Briefcase size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Browse Job Groups
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/my-applications" icon={<FileText size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      My Applications
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/interview-history" icon={<Video size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Interview History
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/mini-projects" icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Mini Projects
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/scores-feedback" icon={<BarChart2 size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Scores & Feedback
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/candidate/profile" icon={<User size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Profile
                    </SidebarLink>
                  </motion.div>
                </nav>

                <motion.div 
                  className="p-4 border-t border-gray-200 space-y-2"
                  variants={itemVariants}
                >
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 mr-3 text-gray-500" />
                    Close Menu
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                    Logout
                  </button>
                </motion.div>
              </motion.aside>

              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                className="fixed inset-0  bg-opacity-50 z-30 md:hidden"
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
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center text-white font-bold"
              >
                SH
              </motion.div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-600 to-zinc-600 bg-clip-text text-transparent">
                SkillHire AI
              </span>
            </motion.div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarLink href="/candidate/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Dashboard
            </SidebarLink>

            <SidebarLink href="/candidate/public-recrutments" icon={<Briefcase size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Public Recruitments
            </SidebarLink>

            <SidebarLink href="/candidate/my-applications" icon={<FileText size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              My Applications
            </SidebarLink>

            <SidebarLink href="/candidate/interview-history" icon={<Video size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Interview History
            </SidebarLink>

            <SidebarLink href="/candidate/mini-projects" icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Projects
            </SidebarLink>

            <SidebarLink href="/candidate/scores-feedback" icon={<BarChart2 size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Scores & Feedback
            </SidebarLink>

            <SidebarLink href="/candidate/profile" icon={<User size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Profile
            </SidebarLink>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:ml-64 h-full overflow-hidden">
          <header className="bg-white border-b gap-5 border-gray-200 py-3 px-10 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div className="md:hidden">
              {!mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="md:flex hidden items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">SH</div>
                  <h1 className="text-lg font-bold text-gray-800">SkillHire AI</h1>
                </motion.div>
              )}
            </div>
            <div className="flex-grow"></div>
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
            {/* <AdvancedNotificationDropdown/> */}

            <AdvancedNotificationDropdown/>
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
        className={`flex items-center p-3 rounded-lg transition-all 
          ${isActive 
            ? "bg-gradient-to-r from-gray-800 to-zinc-900 text-zinc-100 font-medium shadow-sm"
            : "text-gray-700 hover:bg-gray-50"}`}
      >
        <span className={`mr-3 flex-shrink-0 transition-colors ${
          isActive ? "text-zinc-500" : "text-gray-500 hover:text-blue-500"
        }`}>
          {icon}
        </span>
        <span className="text-sm flex-grow">{children}</span>
      </Link>
    </motion.div>
  );
});

export default CandidateLayout;
