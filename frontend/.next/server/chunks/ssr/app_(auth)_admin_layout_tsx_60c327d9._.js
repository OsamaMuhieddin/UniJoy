module.exports = {

"[project]/app/(auth)/admin/layout.tsx [app-rsc] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
// "use client";
// import { motion, AnimatePresence } from 'framer-motion';
// import Sidebar from "@/components/sidebars/Sidebar";
// import { Menu } from "lucide-react";
// import { useState } from "react";
// import { usePathname } from "next/navigation";
// const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
//     const [activeTab, setActiveTab] = useState<string>('dashboard');
//     const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
//     const pathname = usePathname();
//     let title = "Dashboard";
//     if (pathname.includes("patients")) title = "Dashboard Account Patients";
//     if (pathname.includes("appointments")) title = "Dashboard Appointments";
//     return (
//         <>
//             <div className="flex">
//                 {/* ✅ زر فتح القائمة يظهر فقط في الشاشات الصغيرة */}
//                 {/* ✅ تمرير حالة الفتح لـ Sidebar */}
//                 {/* <AnimatePresence>
//                 {sidebarOpen && (
//                     <motion.div
//                         initial={{ x: -300, opacity: 0 }}
//                         animate={{ x: 0, opacity: 1 }}
//                         exit={{ x: -300, opacity: 0 }}
//                         transition={{ type: 'spring', damping: 25 }}
//                         className="w-64 relative bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl"
//                     >
//                         <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setSidebarOpen={setSidebarOpen} setActiveTab={setActiveTab} />
//                     </motion.div>
//                 )}
//             </AnimatePresence> */}
//                 {/* ✅ المحتوى الرئيسي */}
//                 <div className="flex-1">
//                     <button className="md:hidden p-4 text-gray-600"
//                         onClick={() => setSidebarOpen(true)}
//                     >
//                         <Menu className="w-6 h-6" />
//                     </button>
//                     <div className="p-4 overflow-x-auto">{children}</div>
//                 </div>
//             </div>
//         </>
//     );
// };
// export default DashboardLayout;
// 'use client';
// import { useState } from 'react';
// import { usePathname } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Menu, X } from 'lucide-react';
// import AdminSidebar from '@/components/sidebars/AdminSidebar';
// export default function AdminLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const pathname = usePathname();
//     // تحديد العنوان حسب المسار
//     const getPageTitle = () => {
//         const segment = pathname.split('/').pop();
//         switch (segment) {
//             case 'dashboard': return 'Dashboard Overview';
//             case 'events': return 'Events Management';
//             case 'users': return 'User Administration';
//             case 'settings': return 'System Settings';
//             default: return 'Admin Panel';
//         }
//     };
//     return (
//         <div className="flex h-screen bg-gray-50">
//             {/* Mobile Menu Button */}
//             <button
//                 className="md:hidden fixed z-50 top-4 left-4 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
//                 onClick={() => setSidebarOpen(true)}
//             >
//                 <Menu className="w-5 h-5" />
//             </button>
//             {/* Sidebar */}
//             <AnimatePresence>
//                 {sidebarOpen && (
//                     <>
//                         {/* Overlay */}
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             className="fixed inset-0 bg-black/50 md:hidden z-40"
//                             onClick={() => setSidebarOpen(false)}
//                         />
//                         {/* Sidebar Content */}
//                         <motion.aside
//                             initial={{ x: -300 }}
//                             animate={{ x: 0 }}
//                             exit={{ x: -300 }}
//                             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                             className="fixed md:relative z-50 h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl"
//                         >
//                             <div className="p-4 flex justify-end md:hidden">
//                                 <button
//                                     onClick={() => setSidebarOpen(false)}
//                                     className="p-1 rounded-full hover:bg-indigo-700"
//                                 >
//                                     <X className="w-5 h-5" />
//                                 </button>
//                             </div>
//                             <AdminSidebar currentPath={pathname} />
//                         </motion.aside>
//                     </>
//                 )}
//             </AnimatePresence>
//             {/* Main Content */}
//             <div className={`flex-1 flex flex-col transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
//             <header className="bg-white shadow-sm p-4">
//                 <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
//             </header>
//             <main className="flex-1 overflow-y-auto p-6">
//                 {children}
//             </main>
//         </div>
//     </div >
//   );
// }
}}),

};

//# sourceMappingURL=app_%28auth%29_admin_layout_tsx_60c327d9._.js.map