// import { useState, useEffect } from "react";
// import { 
//   TrendingUp,
//   TrendingDown,
//   Users,
//   Clock,
//   DollarSign,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   Plus,
//   Calendar,
//   Briefcase,
//   BarChart2,
//   FileText,
//   ArrowUpRight,
//   ArrowDownRight,
//   Eye,
//   CalendarDays,
//   Target,
//   Activity,
//   RefreshCw
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { BaseURL } from "../../configs/api";

// interface DashboardStats {
//   total_appointments: number;
//   pending_count: number;
//   confirmed_count: number;
//   completed_count: number;
//   canceled_count: number;
//   total_services: number;
//   total_revenue: number;
//   last_updated: string;
// }

// interface RecentAppointment {
//   ID: string;
//   start_time: string;
//   end_time: string;
//   status: string;
//   service: {
//     name: string;
//     cost: number;
//   };
//   customer: {
//     name: string;
//     email: string;
//   };
// }

// interface QuickAction {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
//   url: string;
//   color: string;
// }

// interface RevenueData {
//   date: string;
//   revenue: number;
//   count: number;
//   services: number;
// }

// const DashboardHome = () => {
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Dashboard data
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
//   const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
//   const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

//   // Fetch dashboard data
//   const fetchDashboardData = async (isRefresh = false) => {
//     if (isRefresh) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
//     setError(null);
    
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const headers = {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       };

//       // Fetch all dashboard data in parallel
//       const [statsRes, appointmentsRes, actionsRes, revenueRes] = await Promise.all([
//         fetch(`${BaseURL}/provider/dashboard/overview`, { headers }),
//         fetch(`${BaseURL}/provider/dashboard/recent-appointments?limit=5`, { headers }),
//         fetch(`${BaseURL}/provider/dashboard/quick-actions`, { headers }),
//         fetch(`${BaseURL}/provider/dashboard/revenue?range=week`, { headers })
//       ]);

//       if (statsRes.ok) {
//         const statsData = await statsRes.json();
//         setStats(statsData);
//       }

//       if (appointmentsRes.ok) {
//         const appointmentsData = await appointmentsRes.json();
//         setRecentAppointments(appointmentsData);
//       }

//       if (actionsRes.ok) {
//         const actionsData = await actionsRes.json();
//         setQuickActions(actionsData.quick_actions);
//       }

//       if (revenueRes.ok) {
//         const revenueData = await revenueRes.json();
//         setRevenueData(revenueData.data || []);
//       }
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // Handle refresh
//   const handleRefresh = () => {
//     fetchDashboardData(true);
//   };

//   // Calculate percentage changes for stats
//   const getPercentageChange = (current: number, previous: number) => {
//     if (previous === 0) return current > 0 ? 100 : 0;
//     return ((current - previous) / previous) * 100;
//   };

//   // Format currency
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(amount);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Get status color
//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'confirmed': return 'bg-blue-100 text-blue-800';
//       case 'completed': return 'bg-green-100 text-green-800';
//       case 'canceled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Get status icon
//   const getStatusIcon = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'pending': return <Clock className="h-4 w-4" />;
//       case 'confirmed': return <CheckCircle className="h-4 w-4" />;
//       case 'completed': return <CheckCircle className="h-4 w-4" />;
//       case 'canceled': return <XCircle className="h-4 w-4" />;
//       default: return <AlertCircle className="h-4 w-4" />;
//     }
//   };

//   // Get quick action icon
//   const getQuickActionIcon = (iconName: string) => {
//     switch (iconName) {
//       case 'calendar': return <Calendar className="h-5 w-5" />;
//       case 'clock': return <Clock className="h-5 w-5" />;
//       case 'list': return <FileText className="h-5 w-5" />;
//       case 'plus': return <Plus className="h-5 w-5" />;
//       case 'users': return <Users className="h-5 w-5" />;
//       case 'chart': return <BarChart2 className="h-5 w-5" />;
//       case 'add': return <Plus className="h-5 w-5" />;
//       case 'clipboard': return <FileText className="h-5 w-5" />;
//       default: return <Calendar className="h-5 w-5" />;
//     }
//   };

//   const user = JSON.parse(localStorage.getItem("user") || '{}');
//   const isReceptionist = user?.role_id === 4;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//         <div className="flex">
//           <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
//           <p className="text-red-800">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
//             <p className="text-indigo-100 mt-1">
//               Here's what's happening with your business today
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="hidden md:block text-right">
//               <p className="text-indigo-100 text-sm">Last updated</p>
//               <p className="font-semibold">
//                 {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : 'Just now'}
//               </p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
//               title="Refresh dashboard"
//             >
//               <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Appointments</p>
//               <p className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</p>
//               <div className="flex items-center mt-2">
//                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//                 <span className="text-sm text-green-600">+12% from last month</span>
//               </div>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <Calendar className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//               <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.total_revenue || 0)}</p>
//               <div className="flex items-center mt-2">
//                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//                 <span className="text-sm text-green-600">+8% from last month</span>
//               </div>
//             </div>
//             <div className="p-3 bg-green-100 rounded-lg">
//               <DollarSign className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Active Services</p>
//               <p className="text-2xl font-bold text-gray-900">{stats?.total_services || 0}</p>
//               <div className="flex items-center mt-2">
//                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//                 <span className="text-sm text-green-600">+3 new this month</span>
//               </div>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <Briefcase className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
//               <p className="text-2xl font-bold text-gray-900">{stats?.pending_count || 0}</p>
//               <div className="flex items-center mt-2">
//                 <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
//                 <span className="text-sm text-yellow-600">Requires attention</span>
//               </div>
//             </div>
//             <div className="p-3 bg-yellow-100 rounded-lg">
//               <Clock className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Status Overview and Quick Actions */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">Appointment Status</h3>
//             <Link 
//               to="/service-dashboard/appointments"
//               className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
//             >
//               View all
//               <ArrowUpRight className="h-4 w-4 ml-1" />
//             </Link>
//           </div>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
//               <div className="flex items-center">
//                 <Clock className="h-5 w-5 text-yellow-600 mr-3" />
//                 <span className="font-medium text-gray-900">Pending</span>
//               </div>
//               <span className="text-lg font-bold text-yellow-600">{stats?.pending_count || 0}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//               <div className="flex items-center">
//                 <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
//                 <span className="font-medium text-gray-900">Confirmed</span>
//               </div>
//               <span className="text-lg font-bold text-blue-600">{stats?.confirmed_count || 0}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//               <div className="flex items-center">
//                 <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
//                 <span className="font-medium text-gray-900">Completed</span>
//               </div>
//               <span className="text-lg font-bold text-green-600">{stats?.completed_count || 0}</span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
//               <div className="flex items-center">
//                 <XCircle className="h-5 w-5 text-red-600 mr-3" />
//                 <span className="font-medium text-gray-900">Canceled</span>
//               </div>
//               <span className="text-lg font-bold text-red-600">{stats?.canceled_count || 0}</span>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//           <div className="grid grid-cols-1 gap-3">
//             {quickActions.map((action) => (
//               <Link
//                 key={action.id}
//                 to={action.url}
//                 className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
//               >
//                 <div className={`p-2 rounded-lg mr-3 bg-${action.color}-100`}>
//                   <div className={`h-5 w-5 text-${action.color}-600`}>
//                     {getQuickActionIcon(action.icon)}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">{action.title}</p>
//                   <p className="text-sm text-gray-500">{action.description}</p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Recent Appointments */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
//           <Link 
//             to="/service-dashboard/appointments"
//             className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
//           >
//             View all appointments
//             <ArrowUpRight className="h-4 w-4 ml-1" />
//           </Link>
//         </div>
//         {recentAppointments.length > 0 ? (
//           <div className="space-y-4">
//             {recentAppointments.map((appointment) => (
//               <div key={appointment.ID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                 <div className="flex items-center space-x-4">
//                   <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
//                     <Calendar className="h-5 w-5 text-indigo-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{appointment.service.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {appointment.customer.name} • {formatDate(appointment.start_time)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
//                     {getStatusIcon(appointment.status)}
//                     <span className="ml-1">{appointment.status}</span>
//                   </span>
//                   <span className="text-sm font-medium text-gray-900">
//                     {formatCurrency(appointment.service.cost)}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <Calendar className="mx-auto h-12 w-12 text-gray-400" />
//             <h3 className="mt-2 text-sm font-medium text-gray-900">No recent appointments</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               You don't have any appointments yet. Start by creating a service.
//             </p>
//             <div className="mt-6">
//               <Link
//                 to="/service-dashboard/services"
//                 className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create Service
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Revenue Chart Placeholder */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
//           <div className="flex space-x-2">
//             <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg">Week</button>
//             <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Month</button>
//             <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Year</button>
//           </div>
//         </div>
//         <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
//           <div className="text-center">
//             <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
//             <p className="mt-2 text-sm text-gray-500">Revenue chart will be displayed here</p>
//             <p className="text-xs text-gray-400">Chart integration coming soon</p>
//           </div>
//         </div>
//       </div>

//       {/* Performance Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Completion Rate</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.total_appointments && stats?.completed_count 
//                   ? Math.round((stats.completed_count / stats.total_appointments) * 100) 
//                   : 0}%
//               </p>
//             </div>
//             <div className="p-3 bg-green-100 rounded-lg">
//               <Target className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Average Revenue</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.completed_count && stats?.total_revenue 
//                   ? formatCurrency(stats.total_revenue / stats.completed_count) 
//                   : formatCurrency(0)}
//               </p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <Activity className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Services per Day</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.completed_count ? Math.round(stats.completed_count / 30) : 0}
//               </p>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <CalendarDays className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardHome; 