import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentCheckIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { donationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New Assignments');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('distance_too_far');

  const fetchTasks = useCallback(async () => {
    try {
      const statusMap = {
        'New Assignments': 'Assigned',
        'In Progress': 'In Process',
        'Completed': 'Completed'
      };
      const response = await donationAPI.getVolunteerTasks({ status: statusMap[activeTab] });
      setTasks(response.data.data.donations);
    } catch (error) {
      console.error('Failed to fetch volunteer tasks:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000); // Polling as fallback for sockets
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleResponse = async (id, action, feedback = '') => {
    try {
      await donationAPI.respondToTask(id, action, feedback);
      toast.success(action === 'accept' ? 'Task accepted!' : 'Task declined');
      fetchTasks();
      setShowRejectModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error('Action failed. Please try again.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await donationAPI.completeTask(id);
      toast.success('Pickup completed! Great job.');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const tabs = ['New Assignments', 'In Progress', 'Completed'];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Volunteer Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name}. You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{tasks.length}</span> {activeTab.toLowerCase()}.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-700/50 relative z-10 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setLoading(true); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <motion.div
                  layout
                  key={task._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl relative overflow-hidden"
                >
                  {/* Status indicator line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    activeTab === 'New Assignments' ? 'bg-amber-500' :
                    activeTab === 'In Progress' ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`} />

                  <div className="card-body p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {task.category} • ID: {task._id.slice(-6).toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.quantity} {task.unit || 'units'}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-xl border ${
                         activeTab === 'New Assignments' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 text-amber-600' :
                         activeTab === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200/50 text-indigo-600' :
                         'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/50 text-emerald-600'
                      }`}>
                         {activeTab === 'New Assignments' ? <ClockIcon className="w-5 h-5" /> : 
                          activeTab === 'In Progress' ? <ArrowRightIcon className="w-5 h-5" /> : 
                          <CheckCircleIcon className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                       {/* Citizen Info */}
                       <div className="flex items-start gap-3">
                         <div className="mt-1 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                           <PhoneIcon className="w-3.5 h-3.5 text-slate-500" />
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Citizen / Contact</p>
                           <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                             {task.userId?.name} <span className="text-slate-400 font-normal">({task.userId?.phone || 'No contact'})</span>
                           </p>
                         </div>
                       </div>

                       {/* Address Info */}
                       <div className="flex items-start gap-3">
                         <div className="mt-1 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                           <MapPinIcon className="w-3.5 h-3.5 text-slate-500" />
                         </div>
                         <div className="flex-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</p>
                           <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                             {task.location?.address}, {task.location?.city}
                           </p>
                           {task.location?.coordinates && (
                             <a 
                               href={`https://www.google.com/maps?q=${task.location.coordinates.latitude},${task.location.coordinates.longitude}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                             >
                               View Precise Location <InformationCircleIcon className="w-3 h-3" />
                             </a>
                           )}
                         </div>
                       </div>

                       {/* NGO Info */}
                       <div className="flex items-start gap-3">
                         <div className="mt-1 p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                           <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-indigo-500" />
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Assigning NGO</p>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                             {task.assignedNGO?.organization?.name || task.assignedNGO?.name || 'Assigned NGO'}
                           </p>
                         </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                      {activeTab === 'New Assignments' && (
                        <>
                          <button
                            onClick={() => handleResponse(task._id, 'accept')}
                            className="flex-1 btn btn-primary py-2 text-xs rounded-xl shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                          >
                            Accept Task
                          </button>
                          <button
                            onClick={() => { setSelectedTask(task); setShowRejectModal(true); }}
                            className="btn bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200/50 py-2 px-3 rounded-xl transition-all"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {activeTab === 'In Progress' && (
                        <button
                          onClick={() => handleComplete(task._id)}
                          className="flex-1 btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl shadow-lg shadow-emerald-500/20 font-bold flex items-center justify-center gap-2"
                        >
                          Mark Completed <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}

                      {activeTab === 'Completed' && (
                        <div className="flex-1 p-2 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200/50">
                          Pickup Successful • {new Date(task.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardDocumentCheckIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No {activeTab.toLowerCase()} found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {activeTab === 'New Assignments' 
                    ? "Great! You're all caught up. New requests from nearby NGOs will appear here." 
                    : "No tasks are currently in this state."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                    <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Unable to Accept?</h3>
                    <p className="text-sm text-slate-500">Please provide a reason to help the NGO reassign.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Standard Reason</label>
                    <select 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="form-select w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm py-3"
                    >
                      <option value="distance_too_far">Distance is too far</option>
                      <option value="out_of_city">Currently out of the city</option>
                      <option value="unavailable">Not available today</option>
                      <option value="personal_emergency">Personal emergency</option>
                      <option value="other">Other (specify below)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Additional Remarks (Mandatory)</label>
                    <textarea
                      value={rejectFeedback}
                      onChange={(e) => setRejectFeedback(e.target.value)}
                      placeholder="Explain why you cannot take this task..."
                      className="form-textarea w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm py-3 h-24"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    disabled={!rejectFeedback.trim()}
                    onClick={() => handleResponse(selectedTask._id, 'reject', `${rejectReason}: ${rejectFeedback}`)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
                  >
                    Submit Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VolunteerDashboard;
