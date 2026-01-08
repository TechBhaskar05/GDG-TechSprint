export function Badge({ status, priority, children, className = "" }) {
  if (status) {
    const statusStyles = {
      submitted:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:border dark:border-slate-700",
      acknowledged:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 dark:border dark:border-blue-500/30 dark:shadow-sm dark:shadow-blue-500/20",
      // FIX: Changed 'in-progress' to 'in_progress' to match backend data
      in_progress:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 dark:border dark:border-orange-500/30 dark:shadow-sm dark:shadow-orange-500/20",
      resolved:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 dark:border dark:border-green-500/30 dark:shadow-sm dark:shadow-green-500/20",
    };

    const statusLabels = {
      submitted: "Submitted",
      acknowledged: "Acknowledged",
      in_progress: "In Progress",
      resolved: "Resolved",
    };

    // Fallback style for unknown statuses
    const currentStyle = statusStyles[status] || statusStyles.submitted;
    const currentLabel = statusLabels[status] || status.replace("_", " ");

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${currentStyle} ${className}`}
      >
        {currentLabel}
      </span>
    );
  }

  if (priority) {
    const priorityStyles = {
      low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 dark:border dark:border-green-500/30 dark:shadow-sm dark:shadow-green-500/20",
      medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 dark:border dark:border-yellow-500/30 dark:shadow-sm dark:shadow-yellow-500/20",
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 dark:border dark:border-red-500/30 dark:shadow-sm dark:shadow-red-500/20",
      // Added support for AI 'Critical' severity if needed
      critical: "bg-red-600 text-white border-none shadow-lg shadow-red-500/40",
    };

    const priorityLabels = {
      low: "Low Priority",
      medium: "Medium Priority",
      high: "High Priority",
      critical: "Critical",
    };

    const currentStyle = priorityStyles[priority] || priorityStyles.medium;
    const currentLabel = priorityLabels[priority] || "Urgent";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${currentStyle} ${className}`}
      >
        {currentLabel}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:border dark:border-slate-700 ${className}`}
    >
      {children}
    </span>
  );
}
