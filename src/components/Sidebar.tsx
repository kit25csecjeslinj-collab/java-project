import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  Target,
  TrendingUp,
  Bell,
  BarChart3,
  Code2,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { UserRole } from '../types/bloodbank';

export type NavTab =
  | 'dashboard'
  | 'donors'
  | 'inventory'
  | 'requests'
  | 'matching'
  | 'forecasting'
  | 'alerts'
  | 'reports'
  | 'codehub';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  pendingRequestsCount: number;
  criticalShortageCount: number;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingRequestsCount,
  criticalShortageCount,
  unreadAlertsCount
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_DONOR']
    },
    {
      id: 'donors',
      label: 'Donor Management',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_DONOR']
    },
    {
      id: 'inventory',
      label: 'Blood Inventory',
      icon: <Layers className="w-4 h-4" />,
      badge: criticalShortageCount > 0 ? `${criticalShortageCount} Low` : undefined,
      badgeColor: 'bg-red-100 text-red-700',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      id: 'requests',
      label: 'Blood Requests',
      icon: <FileText className="w-4 h-4" />,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      id: 'matching',
      label: 'Emergency Matching',
      icon: <Target className="w-4 h-4" />,
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      id: 'forecasting',
      label: 'AI Demand Forecast',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: 'AI ML',
      badgeColor: 'bg-purple-100 text-purple-700 font-bold',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      id: 'alerts',
      label: 'Alerts & Notices',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-red-600 text-white',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_DONOR']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      id: 'codehub',
      label: 'Eclipse & Spring Boot',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'Java 17',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
      allowedRoles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_DONOR']
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Operational Modules
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isAccessible = item.allowedRoles.includes(userRole);
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isAccessible) {
                    onSelectTab(item.id);
                  }
                }}
                disabled={!isAccessible}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  !isAccessible
                    ? 'opacity-35 cursor-not-allowed hover:bg-transparent'
                    : isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isAccessible && (
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Locked</span>
                  )}
                  {isAccessible && item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="pt-4 mt-6 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 text-xs border border-slate-700/60">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Medical Environment</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Spring Security 6 RBAC active with BCrypt credential validation.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>MySQL 8.0 Engine</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
