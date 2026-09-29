/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Slope, SlopeReport, ViewMode, ReportStatus } from './types/slope';
import { INITIAL_SLOPES, INITIAL_REPORTS } from './data/mockSlopes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InteractiveMap } from './components/InteractiveMap';
import { SlopeDetailView } from './components/SlopeDetailView';
import { ReportIssueView } from './components/ReportIssueView';
import { ReportSuccessView } from './components/ReportSuccessView';
import { ReportTrackingView } from './components/ReportTrackingView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminSlopeRegistry } from './components/AdminSlopeRegistry';
import { AdminAddSlopeModal } from './components/AdminAddSlopeModal';
import { QRSignboardModal } from './components/QRSignboardModal';
import { QRScannerModal } from './components/QRScannerModal';
import { EmergencyModal } from './components/EmergencyModal';
import { QRGalleryView } from './components/QRGalleryView';

export default function App() {
  // Master state
  const [slopes, setSlopes] = useState<Slope[]>(INITIAL_SLOPES);
  const [reports, setReports] = useState<SlopeReport[]>(INITIAL_REPORTS);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [selectedSlope, setSelectedSlope] = useState<Slope | null>(INITIAL_SLOPES[0]); // MPS-SEL-0012
  const [activeReport, setActiveReport] = useState<SlopeReport | null>(INITIAL_REPORTS[0]);
  const [trackingReportId, setTrackingReportId] = useState<string>('RPT-2026-00821');

  // Modals state
  const [signboardSlope, setSignboardSlope] = useState<Slope | null>(null);
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [showAddSlopeModal, setShowAddSlopeModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  // Check URL on load for /cerun/:id direct link support (Prompt Section 6)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/cerun/')) {
      const slopeId = path.replace('/cerun/', '').trim();
      const match = slopes.find((s) => s.id.toLowerCase() === slopeId.toLowerCase());
      if (match) {
        setSelectedSlope(match);
        setCurrentView('slope-detail');
      }
    }
  }, [slopes]);

  // Navigate handler with browser history state
  // `slope` overrides selectedSlope when the caller has just set it (state isn't updated yet)
  const handleNavigate = (view: ViewMode, slope: Slope | null = selectedSlope) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'slope-detail' && slope) {
      window.history.pushState({}, '', `/cerun/${slope.id}`);
    } else if (view === 'map') {
      window.history.pushState({}, '', '/');
    }
  };

  // Select slope from map or search
  const handleSelectSlope = (slope: Slope | null) => {
    setSelectedSlope(slope);
  };

  // View slope details page
  const handleViewSlopeDetail = (slope: Slope) => {
    setSelectedSlope(slope);
    handleNavigate('slope-detail', slope);
  };

  // Start reporting issue for a slope
  const handleStartReport = (slope: Slope) => {
    setSelectedSlope(slope);
    handleNavigate('report-issue');
  };

  // Successfully submitted a report
  const handleSubmitReportSuccess = (newReport: SlopeReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActiveReport(newReport);
    setTrackingReportId(newReport.id);
    handleNavigate('report-success');
  };

  // Go to track report screen
  const handleTrackReport = (reportId: string) => {
    setTrackingReportId(reportId);
    handleNavigate('track-report');
  };

  // Open signboard preview modal
  const handleOpenSignboard = (slope: Slope) => {
    setSignboardSlope(slope);
  };

  // Save newly registered slope by PBT Admin
  const handleSaveNewSlope = (newSlope: Slope) => {
    setSlopes((prev) => [newSlope, ...prev]);
    setSelectedSlope(newSlope);
    setShowAddSlopeModal(false);
    // Directly show signboard for the new slope
    setSignboardSlope(newSlope);
  };

  // Update existing slope
  const handleUpdateSlope = (updatedSlope: Slope) => {
    setSlopes((prev) =>
      prev.map((s) => (s.id === updatedSlope.id ? updatedSlope : s))
    );
    if (selectedSlope?.id === updatedSlope.id) {
      setSelectedSlope(updatedSlope);
    }
  };

  // Update report status in PBT Admin
  const handleUpdateReportStatus = (
    reportId: string,
    newStatus: ReportStatus,
    remarks?: string
  ) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedTimeline = r.timeline.map((step) => {
            if (step.title === newStatus) {
              return { ...step, completed: true, current: true, note: remarks };
            }
            return step;
          });
          return {
            ...r,
            status: newStatus,
            officerRemarks: remarks || r.officerRemarks,
            timeline: updatedTimeline
          };
        }
        return r;
      })
    );
  };

  // Header steps: the demo walkthrough is also the main navigation
  const handleJumpToStep = (stepNumber: number) => {
    const slope = selectedSlope || slopes.find((s) => s.id === 'MPS-SEL-0012') || slopes[0];
    setSelectedSlope(slope);

    switch (stepNumber) {
      case 2:
        handleNavigate('slope-detail', slope);
        break;
      case 3:
        handleNavigate('report-issue');
        break;
      case 4:
        handleNavigate('track-report');
        break;
      case 5:
        handleNavigate('qr-gallery');
        break;
      case 6:
        handleNavigate('admin-dashboard');
        break;
      default:
        handleNavigate('map');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* Malaysian Government / PBT Navigation Header */}
      <Header
        currentView={currentView}
        onJumpToStep={handleJumpToStep}
        onOpenQRScanner={() => setShowQRScanner(true)}
        onOpenEmergencyModal={() => setShowEmergencyModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'map' && (
          <InteractiveMap
            slopes={slopes}
            selectedSlope={selectedSlope}
            onSelectSlope={handleSelectSlope}
            onViewSlopeDetail={handleViewSlopeDetail}
            onReportSlope={handleStartReport}
            onViewQRSignboard={handleOpenSignboard}
          />
        )}

        {/* 10-Unit QR Slope Gallery View (as requested: "appearkan tab list 10 unit qr, untuk sample2 cerun") */}
        {currentView === 'qr-gallery' && (
          <QRGalleryView
            slopes={slopes}
            onViewSlopeDetail={handleViewSlopeDetail}
            onOpenSignboard={handleOpenSignboard}
            onReportSlope={handleStartReport}
            onOpenScanner={() => setShowQRScanner(true)}
          />
        )}

        {currentView === 'slope-detail' && selectedSlope && (
          <SlopeDetailView
            slope={selectedSlope}
            onBackToMap={() => handleNavigate('map')}
            onOpenReport={handleStartReport}
            onOpenSignboardModal={handleOpenSignboard}
          />
        )}

        {currentView === 'report-issue' && selectedSlope && (
          <ReportIssueView
            slope={selectedSlope}
            onCancel={() => handleNavigate('slope-detail')}
            onSubmitSuccess={handleSubmitReportSuccess}
          />
        )}

        {currentView === 'report-success' && activeReport && (
          <ReportSuccessView
            report={activeReport}
            onTrackReport={handleTrackReport}
            onBackToMap={() => handleNavigate('map')}
          />
        )}

        {currentView === 'track-report' && (
          <ReportTrackingView
            reports={reports}
            initialReportId={trackingReportId}
            onViewSlopeDetail={(slopeId) => {
              const matched = slopes.find((s) => s.id === slopeId);
              if (matched) {
                setSelectedSlope(matched);
                handleNavigate('slope-detail', matched);
              }
            }}
            onBackToMap={() => handleNavigate('map')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardView
            slopes={slopes}
            reports={reports}
            onViewSlopeDetail={handleViewSlopeDetail}
            onViewReport={handleTrackReport}
            onOpenAddSlope={() => setShowAddSlopeModal(true)}
            onOpenRegistry={() => handleNavigate('admin-slopes')}
            onUpdateReportStatus={handleUpdateReportStatus}
          />
        )}

        {currentView === 'admin-slopes' && (
          <AdminSlopeRegistry
            slopes={slopes}
            onBackToDashboard={() => handleNavigate('admin-dashboard')}
            onViewSlopeDetail={handleViewSlopeDetail}
            onOpenQRSignboard={handleOpenSignboard}
            onOpenAddSlope={() => setShowAddSlopeModal(true)}
            onUpdateSlope={handleUpdateSlope}
          />
        )}
      </main>


      {/* The map fills the screen, so no footer there */}
      {currentView !== 'map' && <Footer onOpenEmergencyModal={() => setShowEmergencyModal(true)} />}

      {/* MODALS */}
      {/* 1. Printable QR Signboard Modal (Enhanced Fit Screen) */}
      {signboardSlope && (
        <QRSignboardModal
          slope={signboardSlope}
          onClose={() => setSignboardSlope(null)}
          onOpenReport={handleStartReport}
        />
      )}

      {/* 2. QR Scanner Camera Simulation Modal */}
      {showQRScanner && (
        <QRScannerModal
          slopes={slopes}
          onClose={() => setShowQRScanner(false)}
          onScanComplete={(scannedSlope) => {
            setShowQRScanner(false);
            setSelectedSlope(scannedSlope);
            handleNavigate('slope-detail', scannedSlope);
          }}
        />
      )}

      {/* 3. Add Slope Registration Modal */}
      {showAddSlopeModal && (
        <AdminAddSlopeModal
          onClose={() => setShowAddSlopeModal(false)}
          onSaveSlope={handleSaveNewSlope}
        />
      )}

      {/* 4. Emergency & Hazard Warnings Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          onClose={() => setShowEmergencyModal(false)}
          onOpenReportForm={() => {
            setShowEmergencyModal(false);
            if (selectedSlope) {
              handleNavigate('report-issue');
            } else {
              setSelectedSlope(slopes[0]);
              handleNavigate('report-issue');
            }
          }}
        />
      )}
    </div>
  );
}
