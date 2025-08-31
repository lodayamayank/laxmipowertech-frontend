import {
  FaBell,
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaBoxes,
  FaUserCog,
  FaPowerOff,
  FaSitemap,
} from "react-icons/fa";
import { MdOutlineTaskAlt, MdSettings } from "react-icons/md";
import { MdNotificationsActive } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FiPackage } from "react-icons/fi";
import { BiUserCheck } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import avatar from "../assets/avatar.png";
import { useState } from 'react';
const DashboardLayout = ({ children }) => {
  const today = new Date().toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
  const [attendanceOpen, setAttendanceOpen] = useState(true); // default open
  const menuItems = [
    { label: "Dashboard", icon: <FaClipboardList />, path: "/dashboard" },
    { label: "My Team", icon: <FaUsers />, path: "/admin/my-team" },
    {
      label: "Attendance",
      icon: <BiUserCheck />,
      children: [
        { label: "Live Dashboard", path: "/dashboard/live-attendance" },
        { label: "Staff", path: "/attendance/staff" },
        { label: "Subcontractor", path: "/attendance/subcontractor" },
        { label: "Labour", path: "/attendance/labour"},
      ],
    },
    {
      label: "Projects",
      icon: <FaClipboardList />,
      path: "/admin/projects",
      disabled: true,
    },
    {
      label: "Work Orders",
      icon: <IoDocumentTextOutline />,
      path: "/dashboard/work-orders",
      disabled: true,
    },
    { label: "Report", icon: <FaClipboardList />, path: "/dashboard/report", disabled: true },
    { label: "Inventory", icon: <FaBoxes />, path: "/dashboard/inventory", disabled: true },
    { label: "Vendors", icon: <FaUserCog />, path: "/dashboard/vendors", disabled: true },
    // {
    //   label: "Purchase Order",
    //   icon: <FiPackage />,
    //   path: "/dashboard/purchase-orders",
    // },
    {
      label: "Branches",
      icon: <FaSitemap />,
      path: "/dashboard/branches",
    },
    // {
    //   label: "Reminders",
    //   icon: <MdNotificationsActive />,
    //   path: "/dashboard/reminders",
    // },
    // { label: "Task", icon: <MdOutlineTaskAlt />, path: "/dashboard/tasks" },
    { label: "Settings", icon: <MdSettings />, path: "/dashboard/settings", disabled: true },
    { label: "Logout", icon: <FaPowerOff />, path: "/login" },
  ];

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[250px] flex-shrink-0 bg-orange-500 text-white flex flex-col items-center py-6">
        <div className="rounded-lg bg-gray-200 mb-6 my-5 mx-5"><img src={logo} alt="Logo" className="w-80" /></div>
        {/* <img
          src={avatar}
          alt="User"
          className="w-20 h-20 rounded-full border-4 border-white mb-2"
        />
        <div className="text-center text-sm font-semibold">sachin vadhel</div>
        <div className="text-xs text-white/80 mb-4">sachinvadhel@gmail.com</div> */}

        {/* Menu */}
        <nav className="flex flex-col w-full">
          {menuItems.map((item) => {
            const isAttendance = item.label === "Attendance";

            return (
              <div key={item.label}>
                {item.children ? (
                  <button
                    className={`flex items-center justify-between w-full px-6 py-3 text-sm text-left transition-all ${isAttendance && attendanceOpen ? "bg-white/20 font-semibold" : ""
                      } text-white hover:bg-white/10`}
                    onClick={() => {
                      if (isAttendance) setAttendanceOpen((prev) => !prev);
                    }}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    <span className="transform transition-transform duration-200">
                      {isAttendance ? (attendanceOpen ? "▲" : "▼") : null}
                    </span>
                  </button>
                ) : (
                  item.disabled ? (
                    <div
                      className="flex items-center gap-3 px-6 py-3 text-sm text-white/50 cursor-not-allowed opacity-50"
                      title="Coming Soon"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-6 py-3 text-sm transition-all ${isActive ? "bg-white/20 font-semibold" : ""
                        } text-white hover:bg-white/10`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  )

                )}

                {/* Render submenu if open */}
                {item.children && isAttendance && attendanceOpen && (
                  <div className="ml-10 text-white text-sm">
                    {item.children.map((sub) =>
                      sub.disabled ? (
                        <div
                          key={sub.label}
                          className="block py-2 text-white/50 cursor-not-allowed opacity-50"
                          title="Coming Soon"
                        >
                          {sub.label}
                        </div>
                      ) : (
                        <NavLink
                          key={sub.label}
                          to={sub.path}
                          className={({ isActive }) =>
                            `block py-2 transition-all ${isActive ? "text-orange-200 font-medium" : "text-white/80"
                            } hover:text-white`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      )
                    )}
                  </div>
                )}

              </div>
            );
          })}


        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div className="flex justify-end items-center px-6 py-4 bg-white shadow z-10">
          <div className="flex gap-4 items-center">
            <button className="text-orange-500 text-xl">
              <FaBell />
            </button>
            <button className="text-orange-500 text-xl">
              <FaCalendarAlt />
            </button>
            <span className="text-sm text-blue-600 font-medium">{today}</span>
          </div>
        </div>

        {/* Children (Main page content) */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
