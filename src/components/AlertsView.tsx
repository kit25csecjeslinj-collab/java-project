import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Check,
  Filter
} from 'lucide-react';
import { AlertItem, AlertSeverity } from '../types/bloodbank';
import { NavTab } from './Sidebar';

interface AlertsViewProps {
  alerts: AlertItem[];
  onMarkRead: (alertId: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onMarkRead,
  onMarkAllRead,
  onNavigate
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Alerts &amp; Operational Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event surveillance for cold storage shortages, emergency hospital orders, and batch operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-xs font-bold text-slate-700">Filter by Severity:</span>
          <div className="inline-flex gap-1 text-xs font-semibold">
            {['ALL', 'critical', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredAlerts.length} notification(s)
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No active alerts match this filter</p>
            <p className="text-xs text-slate-400 mt-1">All clinical surveillance criteria within safe bounds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  !alert.isRead
                    ? isCritical
                      ? 'bg-red-50/60 border-red-300'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-blue-50/40 border-blue-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-red-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isCritical ? (
                      <Flame className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-1">{alert.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.linkTab && (
                    <button
                      onClick={() => onNavigate(alert.linkTab as NavTab)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      View in {alert.linkTab} &rarr;
                    </button>
                  )}

                  {!alert.isRead && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
