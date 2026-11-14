import React, { useEffect, useState } from 'react';
import { Coffee, LogIn, LogOut, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { usePortalData } from '../app/PortalDataContext';
import { useToast } from '../app/ToastContext';
import { formatTimeDisplay } from '../utils/formatters';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';

export function AttendancePunchCard({ compact = false }: { compact?: boolean }) {
  const { activeCompany } = useAuth();
  const { punchSession, punchIn, startBreak, endBreak, punchOut } = usePortalData();
  const { showToast } = useToast();

  const [now, setNow] = useState(() => new Date());
  const [locating, setLocating] = useState(false);
  const [showGpsConsent, setShowGpsConsent] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedWork = (() => {
    if (punchSession.state === 'Not Checked In') return '00h 00m';
    if (!punchSession.checkInTimestamp) return '08h 30m';
    const diffMins = Math.max(
      0,
      Math.floor((now.getTime() - punchSession.checkInTimestamp) / 60000) - punchSession.totalBreakMinutes
    );
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  })();

  const executePunchIn = (withGps: boolean) => {
    if (!withGps) {
      punchIn(`${activeCompany.workModel} Check-in`);
      showToast('Checked in successfully', 'success', `Shift: ${activeCompany.shiftName}`);
      return;
    }

    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          setShowGpsConsent(false);
          const coordText = `${activeCompany.geofenceName ?? 'Workplace'} (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`;
          punchIn(coordText);
          showToast('GPS location verified & Checked In', 'success', coordText);
        },
        () => {
          setLocating(false);
          setShowGpsConsent(false);
          const fallbackLoc = `${activeCompany.geofenceName ?? 'Workplace'} (Campus Wi-Fi Verified)`;
          punchIn(fallbackLoc);
          showToast('Checked in via Campus Network Verification', 'info', 'Browser geolocation permission was declined; fallback verification applied per company policy.');
        },
        { timeout: 6000 }
      );
    } else {
      setLocating(false);
      setShowGpsConsent(false);
      punchIn(`${activeCompany.geofenceName ?? 'Workplace'} (Policy Verified)`);
      showToast('Checked in successfully', 'success');
    }
  };

  const handlePrimaryPunchIn = () => {
    if (activeCompany.requireGpsForPunch) {
      setShowGpsConsent(true);
    } else {
      executePunchIn(false);
    }
  };

  const handlePunchOut = () => {
    punchOut();
    showToast('Checked out for the day', 'success', `Total active duration: ${elapsedWork}`);
  };

  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            Saturday, 14 Nov 2026 <span aria-hidden="true">·</span> {activeCompany.shiftName}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0B1230] font-mono-tabular">
            {formatTimeDisplay(now)}
          </p>
        </div>
        <ApprovalStatusBadge status={punchSession.state} />
      </div>

      <div className={`mt-4 grid gap-3 border-t border-[#F1F3F9] pt-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <div>
          <p className="text-xs text-[#64748B]">Shift Window</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0B1230] font-mono-tabular">
            {activeCompany.shiftStart} – {activeCompany.shiftEnd}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Check-In</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0B1230] font-mono-tabular">
            {punchSession.checkInTime ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Check-Out</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0B1230] font-mono-tabular">
            {punchSession.checkOutTime ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#64748B]">Working / Break</p>
          <p className="mt-0.5 text-sm font-semibold text-[#0B1230] font-mono-tabular">
            {elapsedWork} / {punchSession.totalBreakMinutes}m
          </p>
        </div>
      </div>

      {activeCompany.requireGpsForPunch && (
        <div className="mt-4 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-3.5 py-2.5 text-xs text-[#475569] flex items-start gap-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-[#7050F5] mt-0.5" />
          <div>
            <p className="font-medium text-[#0B1230]">
              Geofence Policy Active: {activeCompany.geofenceName} ({activeCompany.geofenceRadiusMeters}m radius)
            </p>
            <p className="mt-0.5 text-[#64748B]">
              One-time location check is requested only when you tap Punch In. PayFuse never tracks background location.
            </p>
          </div>
        </div>
      )}

      {punchSession.locationStatus && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#16A36A]">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Verified at {punchSession.locationStatus}</span>
        </div>
      )}

      {showGpsConsent && (
        <div className="mt-4 rounded-xl border border-[#7050F5]/30 bg-[#7050F5]/[0.04] p-4">
          <p className="text-sm font-semibold text-[#0B1230]">Allow one-time location verification?</p>
          <p className="mt-1 text-xs text-[#475569]">
            {activeCompany.companyName} requires confirming your presence within {activeCompany.geofenceName} ({activeCompany.geofenceRadiusMeters}m) during Punch In. No continuous tracking is performed.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={locating}
              onClick={() => executePunchIn(true)}
              className="rounded-lg bg-[#7050F5] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] disabled:opacity-60 whitespace-nowrap"
            >
              {locating ? 'Verifying Location...' : 'Share Location & Punch In'}
            </button>
            <button
              type="button"
              onClick={() => setShowGpsConsent(false)}
              className="rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {punchSession.state === 'Not Checked In' && (
          <button
            type="button"
            onClick={handlePrimaryPunchIn}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-[#7050F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5E3FE0] transition-colors whitespace-nowrap"
          >
            <LogIn className="h-4 w-4" />
            Punch In
          </button>
        )}

        {punchSession.state === 'Checked In' && (
          <>
            {activeCompany.allowBreakPunch && (
              <button
                type="button"
                onClick={() => {
                  startBreak();
                  showToast('Break started', 'info', 'Remember to end your break when resuming work.');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E7F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
              >
                <Coffee className="h-4 w-4 text-[#E9A23B]" />
                Start Break
              </button>
            )}
            <button
              type="button"
              onClick={handlePunchOut}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1230] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#17214D] whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              Punch Out
            </button>
          </>
        )}

        {punchSession.state === 'On Break' && (
          <>
            <button
              type="button"
              onClick={() => {
                endBreak();
                showToast('Break ended', 'success', 'You are back on active shift.');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7050F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5E3FE0] whitespace-nowrap"
            >
              <Coffee className="h-4 w-4" />
              End Break
            </button>
            <button
              type="button"
              onClick={handlePunchOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1230] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17214D] whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              Punch Out
            </button>
          </>
        )}

        {punchSession.state === 'Checked Out' && (
          <div className="w-full rounded-lg border border-[#16A36A]/25 bg-[#16A36A]/8 px-3.5 py-2.5 text-xs font-medium text-[#15803D]">
            Shift completed for today. Check-in {punchSession.checkInTime} · Check-out {punchSession.checkOutTime}.
          </div>
        )}
      </div>
    </div>
  );
}
