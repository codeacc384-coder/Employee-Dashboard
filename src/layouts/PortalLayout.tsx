import React, { useState } from 'react';
import { CalendarDays, Clock, LayoutDashboard, Menu, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { EmployeeSidebar } from '../components/EmployeeSidebar';
import { EmployeeTopbar } from '../components/EmployeeTopbar';
import { ToastNotifications } from '../components/ToastNotifications';

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7FC] text-[#0B1230]">
      <EmployeeTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <EmployeeSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 py-5 pb-20 sm:px-6 lg:px-8 lg:py-6 lg:pb-10">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>

      {/* Compact Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-[#E5E7F0] bg-white px-2 lg:hidden no-print"
      >
        {[
          { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
          { to: '/attendance', label: 'Attendance', icon: Clock },
          { to: '/leave', label: 'Leave', icon: CalendarDays },
          { to: '/my-payroll', label: 'Payroll', icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
                  isActive ? 'text-[#7050F5]' : 'text-[#64748B]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[11px] font-medium text-[#64748B]"
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      <ToastNotifications />
    </div>
  );
}
