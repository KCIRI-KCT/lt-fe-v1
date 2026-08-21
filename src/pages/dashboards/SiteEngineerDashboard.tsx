import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { PlanVsActualChart } from '../../components/charts/PlanVsActualChart';
import { KpiPopover } from '../../components/dashboard/KpiPopover';
import { RightDrawer } from '../../components/dashboard/RightDrawer';
import { StationDetailModal } from '../../components/dashboard/StationDetailModal';
import { WorkerAttendanceConsole } from '../../components/dashboard/WorkerAttendanceConsole';
import { useNotifications, InlineAlertBanner } from '../../components/common/NotificationToast';
import { MobilePageWrapper } from '../../components/common/MobilePageWrapper';
import { projectService } from '../../services/projectService';
import { siteService } from '../../services/siteService';
import { safetyService } from '../../services/safetyService';
import type { Project, Site, ChainageData, AIAlert } from '../../types';

// Week-wise, Month-wise, Year-wise Plan vs Actual data
const PLAN_VS_ACTUAL_WEEKLY = [
  { month: 'W1', planned: 2, actual: 1 },
  { month: 'W2', planned: 5, actual: 4 },
  { month: 'W3', planned: 8, actual: 7 },
  { month: 'W4', planned: 12, actual: 11 },
  { month: 'W5', planned: 15, actual: 14 },
];

const PLAN_VS_ACTUAL_MONTHLY = [
  { month: 'Jan', planned: 8, actual: 7 },
  { month: 'Feb', planned: 16, actual: 14 },
  { month: 'Mar', planned: 24, actual: 22 },
  { month: 'Apr', planned: 32, actual: 31 },
  { month: 'May', planned: 40, actual: 37 },
  { month: 'Jun', planned: 48, actual: 45 },
  { month: 'Jul', planned: 56, actual: 52 },
  { month: 'Aug', planned: 64, actual: 60 },
  { month: 'Sep', planned: 72, actual: 68 },
  { month: 'Oct', planned: 80, actual: 76 },
  { month: 'Nov', planned: 88, actual: 84 },
  { month: 'Dec', planned: 100, actual: 95 },
];

const PLAN_VS_ACTUAL_YEARLY = [
  { month: '2022', planned: 10, actual: 10 },
  { month: '2023', planned: 28, actual: 27 },
  { month: '2024', planned: 56, actual: 52 },
  { month: '2025', planned: 85, actual: 80 },
  { month: '2026', planned: 100, actual: 95 },
];

export const SiteEngineerDashboard = () => {
  const { user } = useApp();
  const { inlineAlert, bellShake, unreadCount, clearUnread } = useNotifications(20000);

  // Dynamic API State
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [sitesList, setSitesList] = useState<Site[]>([]);
  const [chainagesList, setChainagesList] = useState<ChainageData[]>([]);
  const [alertsList, setAlertsList] = useState<AIAlert[]>([]);
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      projectService.getProjects(),
      siteService.getSites(),
      siteService.getChainages(),
      safetyService.getAIAlerts(),
    ]).then(([projRes, siteRes, chRes, alertRes]) => {
      if (!isMounted) return;
      if (projRes.status === 'fulfilled') setProjectsList(projRes.value);
      if (siteRes.status === 'fulfilled') setSitesList(siteRes.value);
      if (chRes.status === 'fulfilled') setChainagesList(chRes.value as unknown as ChainageData[]);
      if (alertRes.status === 'fulfilled') setAlertsList(alertRes.value);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state
  const [appliedProject, setAppliedProject] = useState('');
  const [appliedSite, setAppliedSite] = useState('');
  const [appliedChainage, setAppliedChainage] = useState('');

  // Plan vs Actual Chart toggle: week / month / year & Selected Year/Month
  const [chartRange, setChartRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartYear, setChartYear] = useState<string>('2026');
  const [chartMonth, setChartMonth] = useState<string>('August');

  // KPI popover detail card state
  const [activeKpiCardId, setActiveKpiCardId] = useState<string | null>(null);

  // Active station detail popover state
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  // Right Drawer Notifications Center toggle state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Active leaderboard details index
  const [activeLeaderboardIdx, setActiveLeaderboardIdx] = useState<number>(0);

  // ── DYNAMIC ALLOCATION COMPUTATIONS ──
  const allocatedProjects = useMemo(() => {
    return projectsList.filter(
      (p) =>
        p.engineerId === user?.id ||
        p.managerId === user?.id ||
        p.engineerName === user?.name ||
        p.managerName === user?.name
    );
  }, [projectsList, user]);

  const allocatedSites = useMemo(() => {
    if (user?.role === 'site_supervisor' || user?.role === 'site_engineer' || user?.role === 'safety_manager' || user?.role === 'safety_officer') {
      const match = sitesList.filter(
        (s) =>
          s.supervisorId === user?.id ||
          s.supervisorName === user?.name ||
          (user?.siteName && (s.name.toLowerCase().includes(user.siteName.toLowerCase()) || user.siteName.toLowerCase().includes(s.name.toLowerCase())))
      );
      if (match.length > 0) return match;
      if (user?.siteName) {
        const byName = sitesList.filter(s => s.name === user.siteName);
        if (byName.length > 0) return byName;
      }
      return sitesList.slice(0, 1);
    }
    if (allocatedProjects.length === 0) return sitesList;
    return sitesList.filter((s) =>
      allocatedProjects.some((p) => p.id === s.projectId)
    );
  }, [allocatedProjects, sitesList, user]);

  const allocatedChainages = useMemo(() => {
    if (user?.role === 'safety_officer') {
      const match = chainagesList.filter(c =>
        allocatedSites.some(s => s.name === c.site) || (user?.siteName && c.site === user.siteName)
      );
      return match.length > 0 ? match : chainagesList.slice(0, 2);
    }
    return chainagesList.filter((c) =>
      allocatedSites.some((s) => s.name === c.site)
    );
  }, [allocatedSites, chainagesList, user]);

  // Fallbacks if no allocations found
  const projectsToUse = allocatedProjects.length > 0 ? allocatedProjects : projectsList;
  const sitesToUse = allocatedSites.length > 0 ? allocatedSites : sitesList;
  const chainagesToUse = allocatedChainages.length > 0 ? allocatedChainages : chainagesList;

  // Filtered chainages based on active dropdown filters
  const activeChainages = useMemo(() => {
    return chainagesToUse.filter((ch) => {
      if (appliedProject && ch.project !== appliedProject) return false;
      if (appliedSite && ch.site !== appliedSite) return false;
      if (appliedChainage && ch.id !== appliedChainage) return false;
      return true;
    });
  }, [chainagesToUse, appliedProject, appliedSite, appliedChainage]);

  const avgProgress = useMemo(() => {
    if (activeChainages.length > 0) {
      const sum = activeChainages.reduce((acc, ch) => acc + (Number(ch.progress) || 0), 0);
      return sum / activeChainages.length;
    }
    if (projectsToUse.length > 0) {
      const sum = projectsToUse.reduce((acc, p) => acc + (Number(p.progress) || 0), 0);
      const avg = sum / projectsToUse.length;
      return isNaN(avg) ? 35.5 : avg;
    }
    return 35.5;
  }, [activeChainages, projectsToUse]);

  const avgSafetyScore = useMemo(() => {
    if (activeChainages.length > 0) {
      const sum = activeChainages.reduce((acc, ch) => acc + (Number(ch.safetyScore) || 94), 0);
      return sum / activeChainages.length;
    }
    if (sitesToUse.length > 0) {
      const sum = sitesToUse.reduce((acc, s) => acc + (Number(s.safetyScore) || 94), 0);
      const avg = sum / sitesToUse.length;
      return isNaN(avg) ? 94.5 : avg;
    }
    return 94.5;
  }, [activeChainages, sitesToUse]);

  // 1. Dynamic KPIs calculations
  const totalWorkersVal = useMemo(() => {
    if (activeChainages.length > 0) {
      return activeChainages.reduce((sum, ch) => sum + (Number(ch.workers) || 0), 0).toLocaleString('en-IN');
    }
    const sumWorkers = (sitesToUse.reduce((sum, s) => sum + (Number(s.workerCount) || 0), 0) || projectsToUse.reduce((sum, p) => sum + (Number(p.workerCount) || 0), 0) || 120);
    return (isNaN(sumWorkers) ? 120 : sumWorkers).toLocaleString('en-IN');
  }, [activeChainages, sitesToUse, projectsToUse]);

  const safetyScoreVal = useMemo(() => {
    return `${(Number(avgSafetyScore) || 94.5).toFixed(1)}%`;
  }, [avgSafetyScore]);

  const progressVal = useMemo(() => {
    return `${(Number(avgProgress) || 35.5).toFixed(1)}%`;
  }, [avgProgress]);

  // Machinery
  const machineryVal = useMemo(() => {
    if (activeChainages.length > 0) {
      return activeChainages.reduce((sum, ch) => sum + ch.equipment, 0).toString();
    }
    return String(sitesToUse.length * 3 || 8);
  }, [activeChainages, sitesToUse]);

  const activeAlertsList = useMemo(() => {
    return alertsList.filter((alert) => {
      if (appliedChainage && alert.chainageId !== appliedChainage) return false;
      if (appliedSite) {
        const siteObj = sitesToUse.find(s => s.name === appliedSite);
        if (siteObj && alert.siteId !== siteObj.id) return false;
      }
      if (appliedProject) {
        const proj = projectsToUse.find(p => p.name === appliedProject);
        const projSites = proj ? sitesToUse.filter(s => s.projectId === proj.id) : [];
        if (!projSites.some(s => s.id === alert.siteId)) return false;
      }
      return true;
    });
  }, [alertsList, sitesToUse, projectsToUse, appliedProject, appliedSite, appliedChainage]);

  const aiAlertsVal = activeAlertsList.length.toString();

  // PPE Compliance — computed from active AI alerts
  const ppeComplianceVal = useMemo(() => {
    const totalPpePending = activeChainages.reduce((sum, ch) => sum + ch.ppePending, 0);
    const totalWorkers = activeChainages.reduce((sum, ch) => sum + ch.workers, 0) || 1;
    const violationRate = Math.min(30, (totalPpePending / totalWorkers) * 100);
    const dynamicPpe = Math.max(60, Math.round(92 - violationRate));
    return `${dynamicPpe}%`;
  }, [activeChainages]);

  // Quality Audits
  const qualityAuditsVal = useMemo(() => {
    return (activeChainages.length > 0 ? activeChainages.length * 4 : projectsToUse.length * 10 || 22).toString();
  }, [activeChainages, projectsToUse]);

  const dynamicKpiCards = useMemo(() => {
    return [
      { id: 'overall-progress', title: 'Overall Progress', value: progressVal, trend: '-1.5%', isPositive: false, icon: 'bi-bar-chart-fill', badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle' },
      { id: 'total-workers', title: 'Total Workers', value: totalWorkersVal, trend: '+3.1%', isPositive: true, icon: 'bi-people-fill', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
      { id: 'equipment', title: 'Machinery', value: machineryVal, trend: '100% active', isPositive: true, icon: 'bi-gear-wide-connected', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
      { id: 'quality-inspections', title: 'Quality Audits', value: qualityAuditsVal, trend: 'Passed', isPositive: true, icon: 'bi-clipboard-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
      { id: 'safety-compliance', title: 'Safety Score', value: safetyScoreVal, trend: '+0.8%', isPositive: true, icon: 'bi-shield-fill-check', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
      { id: 'ai-alerts', title: 'AI Alerts', value: aiAlertsVal, trend: '-3 cases', isPositive: true, icon: 'bi-robot', badgeClass: 'bg-warning-subtle text-warning border border-warning-subtle' },
      { id: 'ppe-compliance', title: 'PPE Compliance', value: ppeComplianceVal, subtitle: 'Helmet · Vest · Mask · Boots · Gloves', trend: `Compliance ${ppeComplianceVal}`, isPositive: true, icon: 'bi-person-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    ];
  }, [progressVal, totalWorkersVal, machineryVal, qualityAuditsVal, safetyScoreVal, aiAlertsVal, ppeComplianceVal]);


  // 2. Dynamic Safety Leaderboard logic
  const leaderboardTitle = useMemo(() => {
    if (appliedChainage) {
      const selectedCh = chainagesToUse.find(c => c.id === appliedChainage);
      return `Safety Status - ${selectedCh?.name || 'Chainage'}`;
    } else if (appliedSite) {
      return `Safety Status - ${appliedSite}`;
    } else if (appliedProject) {
      return `Safety Leaderboard - ${appliedProject}`;
    }
    return 'Safety Leaderboard - My Projects';
  }, [appliedChainage, appliedSite, appliedProject, chainagesToUse]);

  const leaderboardItems = useMemo(() => {
    if (appliedChainage) {
      const selectedCh = chainagesToUse.find(c => c.id === appliedChainage);
      const siteChainages = chainagesToUse.filter(c => c.site === selectedCh?.site)
        .sort((a, b) => b.safetyScore - a.safetyScore);

      return siteChainages.map((ch, idx) => ({
        rank: idx + 1,
        name: ch.name,
        score: ch.safetyScore,
        icon: 'bi-geo-alt-fill',
        color: ch.safetyScore >= 90 ? '#16a34a' : ch.safetyScore >= 80 ? '#d97706' : '#dc2626',
        medal: ['🥇', '🥈', '🥉'][idx] || String(idx + 1),
        isSelected: ch.id === appliedChainage,
        details: {
          ppe: Math.min(100, Math.round(ch.safetyScore * 1.02)),
          barricade: ch.safetyScore >= 90 ? 'Optimal' : ch.safetyScore >= 80 ? 'Minor Gaps' : 'Critical Missing',
          days: Math.round(ch.safetyScore * 2.2),
          speed: Math.min(100, Math.round(ch.safetyScore * 1.03)),
          violation: ch.safetyScore >= 90 ? 'No Violation' : ['Helmet Missing', 'Vest Missing', 'Perimeter Breach'][idx % 3]
        }
      }));
    } else if (appliedSite) {
      const siteChainages = chainagesToUse.filter(c => c.site === appliedSite)
        .sort((a, b) => b.safetyScore - a.safetyScore);

      return siteChainages.map((ch, idx) => ({
        rank: idx + 1,
        name: ch.name,
        score: ch.safetyScore,
        icon: 'bi-geo-alt-fill',
        color: ch.safetyScore >= 90 ? '#16a34a' : ch.safetyScore >= 80 ? '#d97706' : '#dc2626',
        medal: ['🥇', '🥈', '🥉'][idx] || String(idx + 1),
        details: {
          ppe: Math.min(100, Math.round(ch.safetyScore * 1.02)),
          barricade: ch.safetyScore >= 90 ? 'Optimal' : ch.safetyScore >= 80 ? 'Minor Gaps' : 'Critical Missing',
          days: Math.round(ch.safetyScore * 2.2),
          speed: Math.min(100, Math.round(ch.safetyScore * 1.03)),
          violation: ch.safetyScore >= 90 ? 'No Violation' : ['Helmet Missing', 'Vest Missing', 'Perimeter Breach'][idx % 3]
        }
      }));
    } else if (appliedProject) {
      const projSites = sitesToUse.filter(s => s.projectName === appliedProject)
        .sort((a, b) => b.safetyScore - a.safetyScore);

      return projSites.map((site, idx) => ({
        rank: idx + 1,
        name: site.name,
        score: site.safetyScore,
        icon: 'bi-shield-fill',
        color: site.safetyScore >= 90 ? '#16a34a' : site.safetyScore >= 80 ? '#d97706' : '#dc2626',
        medal: ['🥇', '🥈', '🥉'][idx] || String(idx + 1),
        details: {
          ppe: Math.min(100, Math.round(site.safetyScore * 1.01)),
          barricade: site.safetyScore >= 92 ? 'Optimal' : 'Needs Barricades',
          days: Math.round(site.safetyScore * 2.5),
          speed: Math.min(100, Math.round(site.safetyScore * 1.02)),
          violation: site.safetyScore >= 92 ? 'No Violation' : ['Perimeter Breach', 'PPE Deficiencies', 'Barricade Gaps'][idx % 3]
        }
      }));
    } else {
      const projectsList = projectsToUse.map((p) => {
        const pSites = sitesToUse.filter(s => s.projectId === p.id);
        const score = pSites.length > 0
          ? pSites.reduce((acc, s) => acc + s.safetyScore, 0) / pSites.length
          : 90;
        return { name: p.name, score };
      }).sort((a, b) => b.score - a.score);

      return projectsList.map((proj, idx) => ({
        rank: idx + 1,
        name: proj.name,
        score: Math.round(proj.score),
        icon: 'bi-cone-striped',
        color: proj.score >= 90 ? '#16a34a' : proj.score >= 80 ? '#d97706' : '#dc2626',
        medal: ['🥇', '🥈', '🥉'][idx] || String(idx + 1),
        details: {
          ppe: Math.min(100, Math.round(proj.score * 1.01)),
          barricade: proj.score >= 92 ? 'Optimal' : 'Caution',
          days: Math.round(proj.score * 2.8),
          speed: Math.min(100, Math.round(proj.score * 1.02)),
          violation: proj.score >= 92 ? 'No Violation' : ['PPE Compliance Gaps', 'Unsafe Excavation Barricades'][idx % 2]
        }
      }));
    }
  }, [appliedChainage, appliedSite, appliedProject, chainagesToUse, sitesToUse, projectsToUse]);

  const activeSiteDetail = leaderboardItems[activeLeaderboardIdx] || leaderboardItems[0] || null;

  // 3. Dynamic timeline milestones structure
  const activeTimelineMilestones = useMemo(() => {
    if (appliedChainage) {
      const chainageObj = chainagesToUse.find(c => c.id === appliedChainage);
      const chProgress = chainageObj?.progress || 0;
      return [
        { title: 'Earthwork (Subgrade)', status: 'completed', percentage: 100, date: '12 Jan 2026', desc: 'Embankment compaction & grading complete.' },
        { title: 'Subbase Construction', status: 'completed', percentage: 100, date: '28 Jan 2026', desc: 'Granular subbase layer laid and consolidated.' },
        { title: 'GSB (Granular Sub-base)', status: chProgress > 80 ? 'completed' : 'active', percentage: Math.min(100, Math.round(chProgress * 1.2)), date: '15 Feb 2026', desc: 'Base material spreading & moisture optimization.' },
        { title: 'WMM (Wet Mix Macadam)', status: chProgress > 90 ? 'active' : 'scheduled', percentage: Math.max(0, Math.round((chProgress - 40) * 1.1)), date: '10 Mar 2026', desc: 'Aggregates mixed with water, laid, and rolled.' },
        { title: 'DBM (Dense Bituminous Macadam)', status: 'scheduled', percentage: 0, date: '28 Mar 2026', desc: 'Binder course paving & compaction.' },
        { title: 'BC (Bituminous Concrete)', status: 'scheduled', percentage: 0, date: '15 Apr 2026', desc: 'Wearing course paving & lane markings.' },
      ];
    } else if (appliedSite) {
      const siteObj = sitesToUse.find(s => s.name === appliedSite);
      const siteScore = siteObj?.safetyScore || 90;
      return [
        { title: 'Site Mobilization & Survey', status: 'completed', percentage: 100, date: '05 Jan 2026', desc: 'Clearance, temporary fencing, and equipment setup.' },
        { title: 'Foundation Piling Works', status: 'completed', percentage: 100, date: '20 Jan 2026', desc: 'Cast-in-situ concrete piles complete.' },
        { title: 'Pier Structure Erection', status: siteScore > 90 ? 'completed' : 'active', percentage: 85, date: '10 Feb 2026', desc: 'Substructure concrete pouring & curing.' },
        { title: 'Deck Slab Reinforcement', status: 'active', percentage: 40, date: '05 Mar 2026', desc: 'Rebar assembly for highway deck spans.' },
        { title: 'Prestressing & Cable Tensioning', status: 'scheduled', percentage: 0, date: '25 Mar 2026', desc: 'Post-tensioning of deck cables.' },
        { title: 'Asphalt Wearing Course Laying', status: 'scheduled', percentage: 0, date: '20 Apr 2026', desc: 'Surface paving & joints sealing.' },
      ];
    } else {
      return [
        { title: 'Land Acquisition & Clearances', status: 'completed', percentage: 100, date: '01 Oct 2025', desc: 'RoW handovers and local environmental NOCs.' },
        { title: 'Utility Relocation & Drainage', status: 'completed', percentage: 100, date: '15 Nov 2025', desc: 'Electrical lines shifted, side drains constructed.' },
        { title: 'Earthwork & Base Foundations', status: 'completed', percentage: 100, date: '10 Jan 2026', desc: 'Subgrade soil stabilization across all sections.' },
        { title: 'Pavement Layer Laydown (GSB/WMM)', status: 'active', percentage: 65, date: 'Running', desc: 'Base coarse aggregates spreading & binder compaction.' },
        { title: 'Structural Concrete Spans (Bridges)', status: 'active', percentage: 38, date: 'Running', desc: 'Pier casting and girder launches in progress.' },
        { title: 'Wearing Course & Handover Audits', status: 'scheduled', percentage: 0, date: '15 Jun 2026', desc: 'Bituminous surfacing, safety marking, and QA check.' },
      ];
    }
  }, [appliedChainage, appliedSite, chainagesToUse, sitesToUse]);

  // 4. Dynamic Cumulative Progress Chart Calculation Engine
  const getChartData = () => {
    let baseData = PLAN_VS_ACTUAL_MONTHLY;
    if (chartRange === 'week') baseData = PLAN_VS_ACTUAL_WEEKLY;
    else if (chartRange === 'year') baseData = PLAN_VS_ACTUAL_YEARLY;

    // Apply Year multiplier scaling for historical / future view
    const yearScale = chartYear === '2024' ? 0.65 : chartYear === '2025' ? 0.85 : 1.0;

    const maxActualInBase = baseData[baseData.length - 1].actual;
    const currentProgressTarget = (appliedProject || appliedSite || appliedChainage) ? avgProgress : maxActualInBase;
    const scaleFactor = (currentProgressTarget / maxActualInBase) * yearScale;

    return baseData.map((d) => ({
      ...d,
      planned: Math.min(100, Math.round(d.planned * (yearScale === 1.0 ? 1.0 : yearScale * 1.02))),
      actual: Math.min(100, Math.round(d.actual * scaleFactor)),
    }));
  };

  const handleSearch = () => {
    setAppliedProject(filterProject);
    setAppliedSite(filterSite);
    setAppliedChainage(filterChainage);
  };

  const handleReset = () => {
    setFilterProject('');
    setFilterSite('');
    setFilterChainage('');
    setAppliedProject('');
    setAppliedSite('');
    setAppliedChainage('');
  };

  return (
    <MobilePageWrapper>
      {/* ── 1. Greeting & Top Horizontal Action Bar ── */}
      <section className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3">
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2 className="h4 mb-0 fw-bold text-body">Welcome, {user?.name}!</h2>
          <p className="text-muted mb-0 small">Overview of your allocated construction sites, chainages, and active timelines.</p>
        </div>

        {inlineAlert && (
          <div
            style={{
              position: 'fixed',
              top: '84px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1050,
              width: '90%',
              maxWidth: '480px',
              pointerEvents: 'auto',
            }}
          >
            <InlineAlertBanner alert={inlineAlert} />
          </div>
        )}

        <div className="d-flex align-items-center justify-content-lg-end gap-2" style={{ flex: '0 0 auto' }}>
          {/* Notifications button */}
          <button
            className={`btn btn-white border bg-white position-relative shadow-sm py-1.5 px-3 text-secondary ${unreadCount > 0 ? 'notif-btn-glow' : ''}`}
            onClick={() => { setDrawerOpen(true); clearUnread(); }}
            aria-label="Open Alerts Drawer"
          >
            {/* Pulsing dot */}
            <span
              className="notification-dot-pulse"
              style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#dc2626',
                position: 'absolute',
                top: 6, right: 10,
                display: 'inline-block',
              }}
            />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 5px',
                  lineHeight: 1.4,
                  border: '1.5px solid #fff',
                  minWidth: '18px',
                  textAlign: 'center',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className={bellShake ? 'bell-shake' : ''} style={{ display: 'inline-block' }}>
              <i className="bi bi-bell-fill me-1 text-primary" />
            </span>
            <span>Notification Center ({activeAlertsList.length})</span>
          </button>
        </div>
      </section>

      {/* ── 2. Horizontal Search Filters Panel ── */}
      <section className="card border-0 shadow-sm p-3 bg-white">
        <div className="row g-2 align-items-center">
          {/* Site dropdown */}
          <div className="col-auto">
            <span className="small text-muted fw-bold text-uppercase">
              Site:
            </span>
          </div>
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterSite}
              onChange={(e) => {
                const selectedVal = e.target.value;
                setFilterSite(selectedVal);
                setFilterChainage('');
                if (selectedVal) {
                  const selectedSiteObj = sitesList.find(s => s.name === selectedVal);
                  const matchedProj = projectsList.find(p => p.id === selectedSiteObj?.projectId);
                  if (matchedProj) {
                    setFilterProject(matchedProj.name);
                  }
                } else {
                  setFilterProject('');
                }
              }}
            >
              <option value="">All Allocated Sites</option>
              {allocatedSites.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Chainage dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterChainage}
              onChange={(e) => setFilterChainage(e.target.value)}
              disabled={!filterSite}
            >
              <option value="">All Chainages</option>
              {chainagesToUse
                .filter(c => c.site === filterSite)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              }
            </select>
          </div>

          {/* Filter action buttons */}
          <div className="col-auto d-flex gap-2">
            <button
              className="btn btn-sm btn-primary px-3 d-flex align-items-center gap-1.5"
              onClick={handleSearch}
            >
              <i className="bi bi-search" /> Search
            </button>
            <button
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. KPI Section: Grid of 6 optimized cards ── */}
      <section className="row g-3">
        {dynamicKpiCards.map((card) => (
          <div key={card.id} className="col-6 col-sm-4 col-md-3 col-xl-2">
            <div
              className="card border-0 shadow-sm p-3 h-100 cursor-pointer text-start bg-white"
              style={{
                borderRadius: '8px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onClick={() => setActiveKpiCardId(card.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--admin-shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.3px', lineHeight: '1.2' }}>
                  {card.title}
                </span>
                <span className={`badge ${card.badgeClass} rounded-circle p-1.5 d-flex align-items-center justify-content-center`} style={{ width: 22, height: 22 }}>
                  <i className={`bi ${card.icon}`} />
                </span>
              </div>
              <h3 className="h4 fw-bold text-body mb-1" style={{ letterSpacing: '-0.5px' }}>{card.value}</h3>
              <div className="d-flex align-items-center justify-content-between">
                <span className={`fw-semibold ${card.isPositive ? 'text-success' : 'text-danger'}`} style={{ fontSize: '12px' }}>
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── 4. Mid Section: Timeline + Plan vs Actual chart + Allocated Sites & Chainages ── */}
      <section className="row g-3">

        {/* Site and Chainage Timeline Progress (Replaces the vector map) */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '380px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">
                  {appliedChainage ? 'Highway Layer Progress' : appliedSite ? 'Site Milestones' : 'Project Milestones'}
                </h3>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '9px' }}>
                Timeline Wise
              </span>
            </div>

            <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '290px' }}>
              <div className="timeline-container position-relative pt-2 ps-2">
                <div
                  className="position-absolute bg-light-subtle"
                  style={{
                    left: '20px',
                    top: '24px',
                    bottom: '24px',
                    width: '2px',
                    backgroundColor: '#e9ecef',
                    zIndex: 0
                  }}
                />

                {activeTimelineMilestones.map((milestone, idx) => {
                  let badgeColor = 'bg-secondary';
                  let icon = 'bi-circle';
                  if (milestone.status === 'completed') {
                    badgeColor = 'bg-success';
                    icon = 'bi-check-circle-fill';
                  } else if (milestone.status === 'active') {
                    badgeColor = 'bg-primary';
                    icon = 'bi-play-circle-fill';
                  }

                  return (
                    <div key={idx} className="timeline-item position-relative mb-3 text-start" style={{ paddingLeft: '32px', zIndex: 1 }}>
                      <span
                        className={`position-absolute d-flex align-items-center justify-content-center rounded-circle ${badgeColor} text-white`}
                        style={{
                          left: '4px',
                          top: '2px',
                          width: '18px',
                          height: '18px',
                          fontSize: '10px'
                        }}
                      >
                        <i className={`bi ${icon}`} />
                      </span>
                      <div className="d-flex justify-content-between align-items-start mb-0.5">
                        <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{milestone.title}</span>
                        <span className="text-muted font-monospace" style={{ fontSize: '10.5px' }}>{milestone.date}</span>
                      </div>
                      <p className="text-muted mb-1" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>{milestone.desc}</p>
                      {milestone.percentage > 0 && (
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '4px' }}>
                            <div
                              className={`progress-bar ${milestone.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                              style={{ width: `${milestone.percentage}%` }}
                            />
                          </div>
                          <span className="text-muted font-monospace" style={{ fontSize: '9.5px', fontWeight: 600 }}>{milestone.percentage}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Plan vs Actual Progress Chart */}
        <div className="col-12 col-md-6 col-xl-5">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '350px' }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-2 border-bottom pb-2 gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up-arrow text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">Plan vs Actual Cumulative Progress</h3>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-1.5">
                {/* Period Dropdown (Week / Month / Year) */}
                <select
                  className="form-select form-select-sm py-1 px-2 border-secondary-subtle fw-medium text-dark"
                  style={{ fontSize: '11px', width: 'auto', borderRadius: '6px' }}
                  value={chartRange}
                  onChange={(e) => setChartRange(e.target.value as 'week' | 'month' | 'year')}
                  aria-label="Select chart period range"
                >
                  <option value="week">Week-wise</option>
                  <option value="month">Month-wise</option>
                  <option value="year">Year-wise</option>
                </select>

                {/* Month Dropdown (shown when chartRange is 'week' or 'month') */}
                {(chartRange === 'week' || chartRange === 'month') && (
                  <select
                    className="form-select form-select-sm py-1 px-2 border-secondary-subtle fw-medium text-dark"
                    style={{ fontSize: '11px', width: 'auto', borderRadius: '6px' }}
                    value={chartMonth}
                    onChange={(e) => setChartMonth(e.target.value)}
                    aria-label="Select chart target month"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}

                {/* Year Dropdown */}
                {chartRange !== 'year' && (
                  <select
                    className="form-select form-select-sm py-1 px-2 border-secondary-subtle fw-medium text-dark"
                    style={{ fontSize: '11px', width: 'auto', borderRadius: '6px' }}
                    value={chartYear}
                    onChange={(e) => setChartYear(e.target.value)}
                    aria-label="Select chart target year"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                )}

                {/* Reset Chart Period Filters Button */}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm py-1 px-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '11px', borderRadius: '6px' }}
                  onClick={() => {
                    setChartRange('month');
                    setChartMonth('August');
                    setChartYear('2026');
                  }}
                  title="Reset chart period filters"
                >
                  <i className="bi bi-arrow-counterclockwise" style={{ fontSize: '11px' }} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100 p-1">
              <PlanVsActualChart data={getChartData()} />
            </div>
          </div>
        </div>

        {/* Allocated Sites & Chainages panel (Replaces Budget Burn Card) */}
        <div className="col-12 col-md-12 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '380px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">My Allocations</h3>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '9px' }}>
                Active Assignment
              </span>
            </div>

            <div className="flex-grow-1 overflow-auto text-start" style={{ maxHeight: '300px' }}>
              <div className="d-flex flex-column gap-3">
                {allocatedSites.length > 0 ? (
                  allocatedSites.map((site) => {
                    const isSelectedSite = appliedSite === site.name;
                    return (
                      <div
                        key={site.id}
                        className={`p-2.5 rounded border cursor-pointer ${isSelectedSite ? 'bg-primary-subtle border-primary-subtle' : 'bg-light-subtle border-light'}`}
                        style={{ transition: 'all 0.15s ease' }}
                        onClick={() => {
                          setFilterProject(site.projectName || '');
                          setFilterSite(site.name);
                          setFilterChainage('');
                          setAppliedProject(site.projectName || '');
                          setAppliedSite(site.name);
                          setAppliedChainage('');
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <strong className="text-dark" style={{ fontSize: '13px' }}>{site.name}</strong>
                            <div className="text-muted small" style={{ fontSize: '10px' }}>{site.projectName}</div>
                          </div>
                          <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>
                            {site.safetyScore}% Safe
                          </span>
                        </div>

                        {/* List nested chainages allocated to this site */}
                        <div className="mt-2 pt-2 border-top d-flex flex-wrap gap-1.5">
                          {allocatedChainages
                            .filter((c) => c.site === site.name)
                            .map((c) => {
                              const isSelectedChainage = appliedChainage === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  className={`btn btn-xs py-1 px-2 border rounded-pill ${isSelectedChainage ? 'btn-primary border-primary' : 'btn-light border-light-subtle'}`}
                                  style={{ fontSize: '10.5px' }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Avoid triggering site click
                                    setFilterProject(site.projectName || '');
                                    setFilterSite(site.name);
                                    setFilterChainage(c.id);
                                    setAppliedProject(site.projectName || '');
                                    setAppliedSite(site.name);
                                    setAppliedChainage(c.id);
                                  }}
                                >
                                  <i className="bi bi-geo-alt-fill me-0.5" />
                                  {c.id}
                                </button>
                              );
                            })
                          }
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted small text-center py-5">
                    No active sites or chainages allocated.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── 5. Bottom Section: Safety Cause & Operations Console ── */}
      <section className="row g-3">
        {/* Box 1: Safety Leaderboard & Analysis */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '380px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-5" />
                <h3 className="h6 mb-0 fw-bold">{leaderboardTitle}</h3>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>Compliance Log</span>
            </div>

            {leaderboardItems.length > 0 ? (
              <div className="row g-3 flex-grow-1 align-items-stretch">
                {/* Left split: leaderboard list */}
                <div className="col-5 border-end pe-3 d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {leaderboardItems.map((item, idx) => (
                    <div
                      key={item.name}
                      className={`d-flex align-items-center justify-content-between p-2 rounded cursor-pointer border ${activeLeaderboardIdx === idx
                        ? 'bg-primary-subtle border-primary-subtle fw-semibold text-primary'
                        : 'bg-light-subtle border-light-subtle text-body'
                        }`}
                      style={{ fontSize: '12px', transition: 'all 0.15s ease' }}
                      onClick={() => setActiveLeaderboardIdx(idx)}
                    >
                      <div className="d-flex align-items-center gap-1.5 min-width-0">
                        <span className="fw-bold" style={{ width: '22px' }}>{item.rank <= 3 ? item.medal : item.rank}</span>
                        <span className="text-truncate fw-semibold" style={{ maxWidth: '200px' }}>{item.name}</span>
                      </div>
                      <span className="fw-bold" style={{ color: item.color }}>{item.score}%</span>
                    </div>
                  ))}
                </div>

                {/* Right split: detailed factors */}
                <div className="col-7 ps-3 d-flex flex-column justify-content-between">
                  {activeSiteDetail ? (
                    <div className="d-flex flex-column h-100 justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold text-dark text-truncate" style={{ fontSize: '14px', maxWidth: '180px' }}>
                            {activeSiteDetail.name}
                          </span>
                          <span className="badge p-1.5" style={{ backgroundColor: activeSiteDetail.color + '22', color: activeSiteDetail.color, border: `1px solid ${activeSiteDetail.color}` }}>
                            Score: {activeSiteDetail.score}%
                          </span>
                        </div>
                        <p className="text-muted small mb-2.5">
                          Root cause factors contributing to the safety scorecard ranking:
                        </p>

                        <div className="d-grid gap-2" style={{ fontSize: '12.5px' }}>
                          {/* PPE */}
                          <div>
                            <div className="d-flex justify-content-between mb-0.5">
                              <span className="text-muted">PPE Compliance Rate:</span>
                              <strong className="text-dark">{activeSiteDetail.details.ppe}%</strong>
                            </div>
                            <div className="progress" style={{ height: '5px' }}>
                              <div
                                className="progress-bar bg-success"
                                style={{ width: `${activeSiteDetail.details.ppe}%` }}
                              />
                            </div>
                          </div>

                          {/* Speed Limit */}
                          <div>
                            <div className="d-flex justify-content-between mb-0.5">
                              <span className="text-muted">Machinery Speed Compliance:</span>
                              <strong className="text-dark">{activeSiteDetail.details.speed}%</strong>
                            </div>
                            <div className="progress" style={{ height: '5px' }}>
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: `${activeSiteDetail.details.speed}%` }}
                              />
                            </div>
                          </div>

                          {/* Barricades */}
                          <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                            <span className="text-muted">Safety Perimeter Barricades:</span>
                            <span className={`badge ${activeSiteDetail.details.barricade === 'Optimal'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-warning-subtle text-warning border border-warning-subtle'
                              }`}>
                              {activeSiteDetail.details.barricade}
                            </span>
                          </div>

                          {/* Primary Hazard */}
                          <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                            <span className="text-muted">Key Hazard / Violation:</span>
                            <span className={`badge ${activeSiteDetail.details.violation === 'No Violation'
                              ? 'bg-success-subtle text-success border'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                              }`}>
                              {activeSiteDetail.details.violation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Incident Free Days Banner */}
                      <div className="bg-light p-2.5 rounded border border-light-subtle d-flex align-items-center gap-2 mt-2">
                        <i className="bi bi-shield-fill-plus text-success fs-5" />
                        <div>
                          <div className="fw-bold text-success" style={{ fontSize: '13px' }}>
                            {activeSiteDetail.details.days} Days Incident-Free
                          </div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>
                            Zero severe casualties or site stop notices recorded.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-muted text-center py-5 my-auto">
                No safety compliance records available.
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Worker Attendance Console */}
        <WorkerAttendanceConsole
          selectedProject={appliedProject}
          selectedSite={appliedSite}
          selectedChainage={appliedChainage}
          userRole={user?.role}
        />

      </section>

      {/* ── 6. Floating Popover Modal & Alerts Drawer Overlay ── */}
      {activeKpiCardId && (
        <KpiPopover
          cardId={activeKpiCardId}
          onClose={() => setActiveKpiCardId(null)}
          selectedProject={appliedProject}
          selectedSite={appliedSite}
        />
      )}

      {activeStationId && (
        <StationDetailModal
          stationId={activeStationId}
          chainagesList={chainagesToUse}
          sitesList={sitesList}
          onClose={() => setActiveStationId(null)}
        />
      )}

      <RightDrawer
        isOpen={drawerOpen}
        alerts={alertsList}
        onClose={() => setDrawerOpen(false)}
      />
    </MobilePageWrapper>
  );
};
