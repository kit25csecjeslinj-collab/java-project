import React, { useState } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Bell,
  User,
  ChevronDown,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { UserAccount, UserRole, AlertItem } from '../types/bloodbank';

interface HeaderProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  alerts: AlertItem[];
  onOpenAlerts: () => void;
  onOpenEmergencyMatch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  alerts,
  onOpenAlerts,
  onOpenEmergencyMatch
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const criticalCount = alerts.filter((a) => !a.isRead && a.severity === 'critical').length;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return { label: 'Administrator', badge: 'bg-red-700 text-white' };
      case 'ROLE_STAFF':
        return { label: 'Blood Bank Staff', badge: 'bg-blue-700 text-white' };
      case 'ROLE_DONOR':
        return { label: 'Registered Donor', badge: 'bg-emerald-700 text-white' };
    }
  };

  const currentRoleInfo = getRoleLabel(currentUser.role);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top emergency announcement ticker if critical alerts exist */}
      {criticalCount > 0 && (
        <div className="bg-red-700 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>
              <strong>CRITICAL MEDICAL ALERT:</strong> {criticalCount} urgent alert(s) requiring immediate attention (O- reserve depleted &amp; emergency trauma request pending).
            </span>
          </div>
          <button
            onClick={onOpenEmergencyMatch}
            className="text-xs bg-white text-red-700 px-2.5 py-0.5 rounded font-bold hover:bg-red-50 transition cursor-pointer"
          >
            Launch Emergency Match &rarr;
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-200">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                BloodLink <span className="text-red-600">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Java 17 / Spring Boot
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Smart Blood Inventory. Faster Donor Connections. Better Preparedness.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick Emergency Match CTA button */}
          <button
            onClick={onOpenEmergencyMatch}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Emergency Match</span>
          </button>

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">System Alerts</span>
                  <span className="text-xs text-slate-500 font-medium">{unreadAlerts.length} Unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                        !alert.isRead ? 'bg-red-50/40' : ''
                      }`}
                      onClick={() => {
                        setShowAlertMenu(false);
                        onOpenAlerts();
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 truncate">{alert.title}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{alert.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{alert.timestamp}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowAlertMenu(false);
                      onOpenAlerts();
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    View All Alerts ({alerts.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.fullName.split(' ')[0]} {currentUser.fullName.split(' ')[1]}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{currentRoleInfo.label}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role (Demo)
                </div>
                {allUsers.map((u) => {
                  const roleMeta = getRoleLabel(u.role);
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        isSelected ? 'bg-slate-50 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <div className="text-slate-800">{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">{u.username}</div>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${roleMeta.badge}`}>
                        {roleMeta.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
                <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-600" />
                  Spring Security 6 Role-Based Access Control
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
