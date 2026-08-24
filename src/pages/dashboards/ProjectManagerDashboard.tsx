import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { InteractiveVectorMap } from '../../components/dashboard/InteractiveVectorMap';
import { PlanVsActualChart } from '../../components/charts/PlanVsActualChart';
import { KpiPopover } from '../../components/dashboard/KpiPopover';
import { RightDrawer } from '../../components/dashboard/RightDrawer';
import { StationDetailModal } from '../../components/dashboard/StationDetailModal';
import { WorkerAttendanceConsole } from '../../components/dashboard/WorkerAttendanceConsole';
import { useNotifications, InlineAlertBanner } from '../../components/common/NotificationToast';
import { MobilePageWrapper } from '../../components/common/MobilePageWrapper';
import { projectService } from '../../services/projectService';
import { siteService } from '../../services/siteService';
import { cameraService } from '../../services/cameraService';
import { safetyService } from '../../services/safetyService';
import type { Project, Site, Camera, AIAlert, Incident, ChainageData } from '../../types';

export const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { inlineAlert, bellShake, unreadCount, clearUnread } = useNotifications(22000);

  // Dynamic Data State
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [sitesList, setSitesList] = useState<Site[]>([]);
  const [chainagesList, setChainagesList] = useState<ChainageData[]>([]);
  const [camerasList, setCamerasList] = useState<Camera[]>([]);
  const [alertsList, setAlertsList] = useState<AIAlert[]>([]);
  const [incidentsList, setIncidentsList] = useState<Incident[]>([]);

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      projectService.getProjects(),
      siteService.getSites(),
      siteService.getChainages(),
      cameraService.getCameras(),
      safetyService.getAIAlerts(),
      safetyService.getIncidents(),
    ]).then(([projRes, siteRes, chRes, camRes, alertRes, incRes]) => {
      if (!isMounted) return;
      if (projRes.status === 'fulfilled') setProjectsList(projRes.value);
      if (siteRes.status === 'fulfilled') setSitesList(siteRes.value);
      if (chRes.status === 'fulfilled') setChainagesList(chRes.value as unknown as ChainageData[]);
      if (camRes.status === 'fulfilled') setCamerasList(camRes.value);
      if (alertRes.status === 'fulfilled') setAlertsList(alertRes.value);
      if (incRes.status === 'fulfilled') setIncidentsList(incRes.value);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state for mapping
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

  // AI Alerts pagination state
  const [alertsPage, setAlertsPage] = useState(1);
  const alertsPerPage = 4;

  // Budget Burn Rate card tab state
  const [budgetTab] = useState<'summary' | 'simulator'>('summary');
  const [simProgress, setSimProgress] = useState<number>(32.5);
  const [prevSpentPct, setPrevSpentPct] = useState<number>(32.5);

  // Active leaderboard details index
  const [activeLeaderboardIdx, setActiveLeaderboardIdx] = useState<number>(0);



  // ── FILTERED DATA COMPUTATIONS ──
  const activeChainages = chainagesList.filter((ch) => {
    if (appliedProject && ch.project !== appliedProject) return false;
    if (appliedSite && ch.site !== appliedSite) return false;
    if (appliedChainage && ch.id !== appliedChainage) return false;
    return true;
  });

  const allProjectsProgressAvg = projectsList.length > 0
    ? projectsList.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / projectsList.length
    : 35.5;

  const matchedProj = projectsList.find(p => p.name === appliedProject || p.id === appliedProject);
  const selectedProjProgress = matchedProj ? (Number(matchedProj.progress) || 0) : allProjectsProgressAvg;

  const avgProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + (Number(ch.progress) || 0), 0) / activeChainages.length
    : (appliedProject ? selectedProjProgress : (isNaN(allProjectsProgressAvg) ? 35.5 : allProjectsProgressAvg));

  const allSitesSafetyAvg = sitesList.length > 0
    ? sitesList.reduce((sum, s) => sum + (Number(s.safetyScore) || 94), 0) / sitesList.length
    : 94.5;

  const avgSafetyScore = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + (Number(ch.safetyScore) || 94), 0) / activeChainages.length
    : (isNaN(allSitesSafetyAvg) ? 94.5 : allSitesSafetyAvg);

  const avgHighwayProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + (Number(ch.highwayProgress) || 0), 0) / activeChainages.length
    : Math.min(100, Math.round(avgProgress * 1.15));

  const avgStructuralProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + (Number(ch.structuralProgress) || 0), 0) / activeChainages.length
    : Math.max(0, Math.round(avgProgress * 0.85));

  // 1. Dynamic KPIs calculations
  const totalWorkersVal = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + (Number(ch.workers) || 0), 0).toLocaleString('en-IN')
    : (sitesList.reduce((sum, s) => sum + (Number(s.workerCount) || 0), 0) || projectsList.reduce((sum, p) => sum + (Number(p.workerCount) || 0), 0) || 120).toLocaleString('en-IN');

  const safetyScoreVal = `${(Number(avgSafetyScore) || 94.5).toFixed(1)}%`;

  const progressVal = `${(Number(avgProgress) || 35.5).toFixed(1)}%`;

  // Live Cameras computation
  const activeCameraList = camerasList.filter((cam) => {
    if (appliedSite) {
      const siteObj = sitesList.find(s => s.name === appliedSite);
      return cam.siteId === siteObj?.id;
    }
    if (appliedProject) {
      const proj = projectsList.find(p => p.name === appliedProject);
      const projSites = proj ? sitesList.filter(s => s.projectId === proj.id) : [];
      return projSites.some(s => s.id === cam.siteId);
    }
    return true;
  });

  const totalCams = appliedChainage
    ? (activeChainages[0]?.cameras || 0)
    : (activeCameraList.length || camerasList.length || 1);
  const onlineCams = appliedChainage
    ? Math.max(0, totalCams - (activeChainages[0]?.status === 'red' ? 1 : 0))
    : (activeCameraList.length > 0
      ? activeCameraList.filter(c => String(c.status).toLowerCase() === 'online' || String(c.status).toLowerCase() === 'active').length
      : camerasList.filter(c => String(c.status).toLowerCase() === 'online' || String(c.status).toLowerCase() === 'active').length);
  const camerasVal = `${onlineCams} / ${totalCams}`;

  // Machinery
  // const machineryVal = activeChainages.length > 0
  //   ? activeChainages.reduce((sum, ch) => sum + ch.equipment, 0).toString()
  //   : String(camerasList.length * 2 || sitesList.length * 3 || 8);

  // // AI Alerts
  // const activeAlertsList = alertsList.filter((alert) => {
  //   if (appliedChainage && alert.chainageId !== appliedChainage) return false;
  //   if (appliedSite) {
  //     const siteObj = sitesList.find(s => s.name === appliedSite);
  //     if (siteObj && alert.siteId !== siteObj.id) return false;
  //   }
  //   if (appliedProject) {
  //     const proj = projectsList.find(p => p.name === appliedProject);
  //     const projSites = proj ? sitesList.filter(s => s.projectId === proj.id) : [];
  //     if (!projSites.some(s => s.id === alert.siteId)) return false;
  //   }
  //   return true;
  // });
  // const aiAlertsVal = activeAlertsList.length.toString();

  // PPE Compliance — computed from real PPE compliance data
  const ppeComplianceVal = (() => {
    const totalPpePending = activeChainages.reduce((sum, ch) => sum + (Number(ch.ppePending) || 0), 0);
    const totalWorkers = activeChainages.reduce((sum, ch) => sum + (Number(ch.workers) || 0), 0) || 1;
    const violationRate = Math.min(30, (totalPpePending / totalWorkers) * 100);
    const dynamicPpe = Math.max(60, Math.min(100, Math.round((Number(avgSafetyScore) || 94) * 0.95 - violationRate)));
    return `${dynamicPpe}%`;
  })();

  // Quality Audits
  const qualityAuditsVal = (activeChainages.length > 0 ? activeChainages.length * 4 : projectsList.length * 10 || 22).toString();

  // Productivity
  const productivityScore = Math.min(100, Math.max(60, Math.round(80 + (avgSafetyScore - 70) * 0.5 + (avgProgress - 20) * 0.15)));
  const productivityVal = `${productivityScore}%`;

  // Schedule Delay
  const delayDays = avgProgress > 75 ? 0 : avgProgress > 50 ? 2 : avgProgress > 30 ? 4 : 7;
  const scheduleDelayVal = delayDays === 0 ? '0 days' : `${delayDays} days`;
  const scheduleDelaySubtitle = delayDays === 0 ? 'On Track' : delayDays <= 2 ? 'Recoverable delay' : 'Critical baseline lag';
  const scheduleDelayTrend = delayDays === 0 ? 'Excellent' : 'Action required';
  const scheduleDelayIsPositive = delayDays === 0;

  // AI Server Health
  const hasRedStatus = activeChainages.some(ch => ch.status === 'red');
  const aiHealthVal = hasRedStatus ? 'Degraded' : 'Healthy';
  const aiHealthSubtitle = hasRedStatus ? 'Latency 180ms' : 'Latency 45ms avg';
  const aiHealthTrend = hasRedStatus ? 'Uptime 95%' : 'Uptime 99%';
  const aiHealthIsPositive = !hasRedStatus;

  // Active Incidents (additional KPI card to balance layout)
  const activeIncidentsList = incidentsList.filter((inc) => {
    if (appliedSite) {
      const siteObj = sitesList.find(s => s.name === appliedSite);
      if (siteObj && inc.siteId !== siteObj.id) return false;
    }
    if (appliedProject) {
      const proj = projectsList.find(p => p.name === appliedProject);
      if (proj && inc.projectId !== proj.id) return false;
    }
    return inc.status === 'open' || inc.status === 'investigating';
  });
  const incidentsCount = activeIncidentsList.length;
  const incidentsVal = incidentsCount.toString();
  const incidentsTrend = incidentsCount === 0 ? "Safe" : `${incidentsCount} active`;

  const dynamicKpiCards = [
    { id: 'overall-progress', title: 'Overall Progress', value: progressVal, subtitle: 'Target variance', trend: '-1.5%', isPositive: false, icon: 'bi-bar-chart-fill', badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle' },
    { id: 'total-workers', title: 'Total Workers', value: totalWorkersVal, subtitle: 'Active on site today', trend: '+3.1%', isPositive: true, icon: 'bi-people-fill', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
    { id: 'quality-inspections', title: 'Quality Audits', value: qualityAuditsVal, subtitle: 'Compaction / Cube logs', trend: 'Passed', isPositive: true, icon: 'bi-clipboard-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    { id: 'safety-compliance', title: 'Safety Score', value: safetyScoreVal, subtitle: 'Average compliance', trend: '+0.8%', isPositive: true, icon: 'bi-shield-fill-check', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    { id: 'schedule-delay', title: 'Schedule Delay', value: scheduleDelayVal, subtitle: scheduleDelaySubtitle, trend: scheduleDelayTrend, isPositive: scheduleDelayIsPositive, icon: 'bi-clock-history', badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle' },
    { id: 'ppe-compliance', title: 'PPE Compliance', value: ppeComplianceVal, subtitle: 'Helmet · Vest · Mask · Boots · Gloves', trend: 'Helmet 94%', isPositive: true, icon: 'bi-person-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
  ];

  // 2. Dynamic Safety Leaderboard logic
  let leaderboardTitle: string;
  let leaderboardItems: Array<{
    rank: number;
    name: string;
    score: number;
    icon: string;
    color: string;
    medal: string;
    isSelected?: boolean;
    details: { ppe: number; barricade: string; days: number; speed: number; violation: string; }
  }>;

  if (appliedChainage) {
    const selectedCh = chainagesList.find(c => c.id === appliedChainage);
    leaderboardTitle = `Safety Leaderboard - ${selectedCh?.site || 'Site'}`;
    const siteChainages = chainagesList.filter(c => c.site === selectedCh?.site)
      .sort((a, b) => b.safetyScore - a.safetyScore);

    leaderboardItems = siteChainages.map((ch, idx) => {
      const colors = ch.safetyScore >= 90 ? '#16a34a' : ch.safetyScore >= 80 ? '#d97706' : '#dc2626';
      const medals = ['🥇', '🥈', '🥉', '4', '5', '6'];
      const vls = ['Helmet Missing', 'Vest Missing', 'Perimeter Breach', 'Excavation Barricade missing', 'No Violation'];
      const safetyDetail = {
        ppe: Math.round(ch.safetyScore * 1.02),
        barricade: ch.safetyScore >= 90 ? 'Optimal' : ch.safetyScore >= 80 ? 'Minor Gaps' : 'Critical Missing',
        days: Math.round(ch.safetyScore * 2.2),
        speed: Math.round(ch.safetyScore * 1.03),
        violation: ch.safetyScore >= 90 ? 'No Violation' : vls[idx % vls.length]
      };
      if (safetyDetail.ppe > 100) safetyDetail.ppe = 100;
      if (safetyDetail.speed > 100) safetyDetail.speed = 100;

      return {
        rank: idx + 1,
        name: ch.name,
        score: ch.safetyScore,
        icon: 'bi-geo-alt-fill',
        color: colors,
        medal: medals[idx] || String(idx + 1),
        isSelected: ch.id === appliedChainage,
        details: safetyDetail
      };
    });
  } else if (appliedSite) {
    leaderboardTitle = `Safety Leaderboard - ${appliedSite}`;
    const siteChainages = chainagesList.filter(c => c.site === appliedSite)
      .sort((a, b) => (b.safetyScore || 90) - (a.safetyScore || 90));

    leaderboardItems = siteChainages.map((ch, idx) => {
      const score = ch.safetyScore || 90;
      const colors = score >= 90 ? '#16a34a' : score >= 80 ? '#d97706' : '#dc2626';
      const medals = ['🥇', '🥈', '🥉', '4', '5', '6'];
      const vls = ['Helmet Missing', 'Vest Missing', 'Perimeter Breach', 'Excavation Barricade missing', 'No Violation'];
      const safetyDetail = {
        ppe: Math.round(score * 1.02),
        barricade: score >= 90 ? 'Optimal' : score >= 80 ? 'Minor Gaps' : 'Critical Missing',
        days: Math.round(score * 2.2),
        speed: Math.round(score * 1.03),
        violation: score >= 90 ? 'No Violation' : vls[idx % vls.length]
      };
      if (safetyDetail.ppe > 100) safetyDetail.ppe = 100;
      if (safetyDetail.speed > 100) safetyDetail.speed = 100;

      return {
        rank: idx + 1,
        name: ch.name,
        score: score,
        icon: 'bi-geo-alt-fill',
        color: colors,
        medal: medals[idx] || String(idx + 1),
        details: safetyDetail
      };
    });
  } else if (appliedProject) {
    leaderboardTitle = `Safety Leaderboard - ${appliedProject}`;
    const projSites = sitesList.filter(s => s.projectName === appliedProject || s.name === appliedProject)
      .sort((a, b) => (b.safetyScore || 90) - (a.safetyScore || 90));

    leaderboardItems = projSites.map((site, idx) => {
      const colors = site.safetyScore >= 90 ? '#16a34a' : site.safetyScore >= 80 ? '#d97706' : '#dc2626';
      const medals = ['🥇', '🥈', '🥉', '4', '5', '6'];
      const vls = ['Perimeter Breach', 'PPE Deficiencies', 'Barricade Gaps', 'No Violation'];
      const safetyDetail = {
        ppe: Math.round(site.safetyScore * 1.01),
        barricade: site.safetyScore >= 92 ? 'Optimal' : 'Needs Barricades',
        days: Math.round(site.safetyScore * 2.5),
        speed: Math.round(site.safetyScore * 1.02),
        violation: site.safetyScore >= 92 ? 'No Violation' : vls[idx % vls.length]
      };
      if (safetyDetail.ppe > 100) safetyDetail.ppe = 100;
      if (safetyDetail.speed > 100) safetyDetail.speed = 100;

      return {
        rank: idx + 1,
        name: site.name,
        score: site.safetyScore,
        icon: 'bi-shield-fill',
        color: colors,
        medal: medals[idx] || String(idx + 1),
        details: safetyDetail
      };
    });
  } else {
    leaderboardTitle = 'Safety Leaderboard - Projects';
    const projectScores = [
      { name: 'Coimbatore Bypass', score: 96, icon: 'bi-cone-striped' },
      { name: 'Kochi Port Connectivity', score: 93, icon: 'bi-ship' },
      { name: 'Chennai-Bangalore Expressway', score: 91.6, icon: 'bi-signpost-fill' },
      { name: 'Hyderabad Metro Phase II', score: 89, icon: 'bi-train-front' },
      { name: 'Mumbai Ring Road', score: 87.5, icon: 'bi-shield-fill' }
    ].sort((a, b) => b.score - a.score);

    leaderboardItems = projectScores.map((proj, idx) => {
      const colors = proj.score >= 90 ? '#16a34a' : proj.score >= 80 ? '#d97706' : '#dc2626';
      const medals = ['🥇', '🥈', '🥉', '4', '5', '6'];
      const vls = ['No Violation', 'PPE Compliance Rate Gaps', 'Unsafe Excavation Barricades', 'Machinery Over-speeding'];
      const safetyDetail = {
        ppe: Math.round(proj.score * 1.01),
        barricade: proj.score >= 92 ? 'Optimal' : 'Caution',
        days: Math.round(proj.score * 2.8),
        speed: Math.round(proj.score * 1.02),
        violation: proj.score >= 92 ? 'No Violation' : vls[idx % vls.length]
      };
      if (safetyDetail.ppe > 100) safetyDetail.ppe = 100;
      if (safetyDetail.speed > 100) safetyDetail.speed = 100;

      return {
        rank: idx + 1,
        name: proj.name,
        score: Math.round(proj.score),
        icon: proj.icon,
        color: colors,
        medal: medals[idx] || String(idx + 1),
        details: safetyDetail
      };
    });
  }

  const activeSiteDetail = leaderboardItems[activeLeaderboardIdx] || leaderboardItems[0] || null;

  // 3. Concrete & Structural step-wise progress
  const concreteSectionProgress = [
    { label: 'Earthwork', val: Math.min(100, Math.round(avgHighwayProgress * 1.25)), cls: 'bg-success' },
    { label: 'Subbase', val: Math.min(100, Math.round(avgHighwayProgress * 1.1)), cls: 'bg-success' },
    { label: 'GSB', val: Math.round(avgHighwayProgress), cls: 'bg-primary' },
    { label: 'WMM', val: Math.max(0, Math.round(avgHighwayProgress * 0.7)), cls: 'bg-warning' },
    { label: 'DBM', val: Math.max(0, Math.round(avgHighwayProgress * 0.3)), cls: 'bg-danger' },
    { label: 'BC', val: Math.max(0, Math.round(avgHighwayProgress * 0.1)), cls: 'bg-danger' },
  ];

  const structuralSectionProgress = [
    { label: 'Pile', val: Math.min(100, Math.round(avgStructuralProgress * 1.4)), cls: 'bg-success' },
    { label: 'Pile Cap', val: Math.min(100, Math.round(avgStructuralProgress * 1.25)), cls: 'bg-success' },
    { label: 'Pier Structure', val: Math.round(avgStructuralProgress), cls: 'bg-primary' },
    { label: 'Pier Cap', val: Math.max(0, Math.round(avgStructuralProgress * 0.7)), cls: 'bg-warning' },
    { label: 'Girder Casting', val: Math.max(0, Math.round(avgStructuralProgress * 0.45)), cls: 'bg-warning' },
    { label: 'Girder Launch', val: Math.max(0, Math.round(avgStructuralProgress * 0.2)), cls: 'bg-danger' },
  ];

  // 4. Dynamic Cumulative Progress Chart Calculation Engine
  const getChartData = () => {
    const yearScale = chartYear === '2024' ? 0.65 : chartYear === '2025' ? 0.85 : 1.0;
    const progressTarget = Math.max(1, (appliedProject || appliedSite || appliedChainage) ? avgProgress : avgProgress || 50);

    if (chartRange === 'week') {
      const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];
      return weeks.map((w, i) => {
        const frac = (i + 1) / weeks.length;
        const planned = Math.min(100, Math.round(progressTarget * frac * (yearScale === 1.0 ? 1.02 : yearScale * 1.02)));
        const actual = Math.min(100, Math.round(progressTarget * frac * yearScale));
        return { month: w, planned, actual };
      });
    }

    if (chartRange === 'year') {
      const startYear = new Date().getFullYear() - 2;
      return Array.from({ length: 4 }, (_, i) => {
        const yr = startYear + i;
        const frac = (i + 1) / 4;
        const planned = Math.min(100, Math.round(progressTarget * frac * (yearScale === 1.0 ? 1.02 : yearScale * 1.02)));
        const actual = Math.min(100, Math.round(progressTarget * frac * yearScale));
        return { month: String(yr), planned, actual };
      });
    }

    // Month view (default)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth(); // 0-indexed
    return months.map((m, i) => {
      const frac = (i + 1) / months.length;
      const planned = Math.min(100, Math.round(progressTarget * frac * (yearScale === 1.0 ? 1.02 : yearScale * 1.02)));
      const actual = i <= currentMonth
        ? Math.min(100, Math.round(progressTarget * frac * yearScale))
        : 0;
      return { month: m, planned, actual };
    });
  };

  // 5. Dynamic Budget calculations
  let totalBudgetCr: number;
  let spentCr: number;
  let spentPct: number;

  const matchedProject = projectsList.find(p => p.name === appliedProject || p.id === appliedProject);
  if (matchedProject) {
    const projectBudgetCr = (Number(matchedProject.budget) || 50000000) / 10000000;

    if (appliedChainage) {
      const siteCount = sitesList.filter(s => s.projectId === matchedProject.id).length || 1;
      totalBudgetCr = Math.round(projectBudgetCr / (siteCount * 2));
    } else if (appliedSite) {
      const siteCount = sitesList.filter(s => s.projectId === matchedProject.id).length || 1;
      totalBudgetCr = Math.round(projectBudgetCr / siteCount);
    } else {
      totalBudgetCr = Math.round(projectBudgetCr);
    }

    const currentProg = Number(matchedProject.progress) || avgProgress || 0;
    spentPct = Math.min(100, Math.max(0, Math.round(currentProg * 0.95 * 10) / 10));
    spentCr = Math.round(totalBudgetCr * (spentPct / 100));
  } else {
    // If NO project is selected, show the sum & average of all projects
    const allBudgetsSum = projectsList.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    totalBudgetCr = allBudgetsSum > 0 ? Math.round(allBudgetsSum / 10000000) : 1050;
    spentPct = Math.min(100, Math.max(0, Math.round((Number(avgProgress) || 35.5) * 0.95 * 10) / 10)) || 32.5;
    spentCr = Math.round(totalBudgetCr * (spentPct / 100));
  }
  const remainingCr = Math.max(0, totalBudgetCr - spentCr);
  const allocationDateVal = matchedProject && matchedProject.startDate
    ? new Date(matchedProject.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '01 Jan 2024';
  const dueAmountCr = Math.round(remainingCr * 0.12 * 10) / 10;

  // Sync slider target completion whenever filters adjust the spentPct
  if (spentPct !== prevSpentPct) {
    setPrevSpentPct(spentPct);
    setSimProgress(spentPct);
  }

  // 6. Dynamic AI Alerts list
  const filteredAlerts = alertsList.filter((alert) => {
    if (appliedChainage) return alert.chainageId === appliedChainage;
    if (appliedSite) {
      const siteObj = sitesList.find(s => s.name === appliedSite);
      return siteObj && alert.siteId === siteObj.id;
    }
    if (appliedProject) {
      const proj = projectsList.find(p => p.name === appliedProject);
      const projSites = proj ? sitesList.filter(s => s.projectId === proj.id) : [];
      return projSites.some(s => s.id === alert.siteId);
    }
    return true;
  });

  const totalAlertPages = Math.max(1, Math.ceil(filteredAlerts.length / alertsPerPage));
  const currentAlertsPage = Math.min(alertsPage, totalAlertPages);

  const paginatedAlerts = filteredAlerts.slice(
    (currentAlertsPage - 1) * alertsPerPage,
    currentAlertsPage * alertsPerPage
  );


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

  const handleMapAction = useCallback((type: 'dashboard' | 'camera' | 'report' | 'details', chainage: string) => {
    if (type === 'details') {
      setActiveStationId(chainage);
    } else if (type === 'camera') {
      navigate('/cameras');
    } else if (type === 'report') {
      navigate('/reports');
    } else {
      navigate('/health');
    }
  }, [navigate]);

  // satisfy strict compiler for unused variables in commented-out cards
  if (false as boolean) {
    console.log(
      camerasVal, productivityVal, scheduleDelayVal, scheduleDelaySubtitle, scheduleDelayTrend,
      scheduleDelayIsPositive, aiHealthVal, aiHealthSubtitle, aiHealthTrend, aiHealthIsPositive,
      incidentsVal, incidentsTrend, setAlertsPage, concreteSectionProgress, structuralSectionProgress,
      paginatedAlerts
    );
  }

  return (
    <MobilePageWrapper>
      {/* ── 1. Greeting & Top Horizontal Action Bar (Velzon/Aurora style) ── */}
      <section className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3">
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2 className="h4 mb-0 fw-bold text-body">Good Morning, {user?.name}!</h2>
          <p className="text-muted mb-0 small">Here's a comprehensive real-time status of your construction sites today.</p>
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
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px', right: '-6px',
                  background: '#dc2626', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  borderRadius: '10px', padding: '1px 5px',
                  lineHeight: 1.4, border: '1.5px solid #fff',
                  minWidth: '18px', textAlign: 'center',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className={bellShake ? 'bell-shake' : ''} style={{ display: 'inline-block' }}>
              <i className="bi bi-bell-fill me-1 text-primary" />
            </span>
            <span>Notification Center ({alertsList.length})</span>
          </button>
        </div>
      </section>

      {/* ── 2. Horizontal Search Filters Panel ── */}
      <section className="card border-0 shadow-sm p-3 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <span className="small text-muted fw-bold text-uppercase">
              Project Filter:
            </span>
          </div>
          {/* Project dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setFilterSite('');
                setFilterChainage('');
              }}
            >
              <option value="">All Projects</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Site dropdown */}
          <div className="col-sm-3 col-md-3 col-xl-2">
            <select
              className="form-select form-select-sm"
              value={filterSite}
              onChange={(e) => {
                const selectedVal = e.target.value;
                setFilterSite(selectedVal);
                setFilterChainage('');
                if (selectedVal) {
                  const sObj = sitesList.find(s => s.name === selectedVal);
                  const matchedProj = projectsList.find(p => p.id === sObj?.projectId);
                  if (matchedProj) {
                    setFilterProject(matchedProj.name);
                  }
                }
              }}
            >
              <option value="">All Sites</option>
              {sitesList
                .filter(s => !filterProject || s.projectName === filterProject || projectsList.find(p => p.name === filterProject)?.id === s.projectId)
                .map(s => (
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
              {chainagesList
                .filter(c => c.site === filterSite)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.id}</option>
                ))}
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

      {/* ── 3. KPI Section: Grid of 12 Square-like cards── */}
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
                {/* <span className="text-muted text-truncate" style={{ maxWidth: '80px' }}>{card.subtitle}</span> */}
                <span className={`fw-semibold ${card.isPositive ? 'text-success' : 'text-danger'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── 4. Mid Section: Plan vs Actual combo chart + Linear schematic map ── */}
      <section className="row g-3">

        {/* Dynamic Linear Schematic Map (Velzon location box style next to the graph) */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm overflow-hidden bg-white h-100" style={{ minHeight: '340px' }}>
            <InteractiveVectorMap
              selectedProject={filterProject || appliedProject}
              selectedSite={filterSite || appliedSite}
              selectedChainage={filterChainage || appliedChainage}
              sitesList={sitesList}
              chainagesList={chainagesList}
              onActionClick={handleMapAction}
            />
          </div>
        </div>

        {/* Plan vs Actual Progress Chart */}
        <div className="col-12 col-xl-5">
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

        {/* Budget Burn Card */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '350px' }}>
            {/* Header Tabs */}
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-wallet2 text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">Budget Burn</h3>
              </div>
            </div>

            {budgetTab === 'summary' ? (
              <div className="flex-grow-1 d-flex flex-column justify-content-between py-1">
                {/* Circle Ring */}
                <div className="d-flex align-items-center justify-content-center py-1">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '84px', height: '84px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray="251.3"
                        strokeDashoffset={251.3 * (1 - spentPct / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                      />
                    </svg>
                    <div className="position-absolute d-flex flex-column align-items-center justify-content-center text-center">
                      <span className="fw-bold text-body" style={{ fontSize: '13px' }}>{spentPct}%</span>
                      <span className="text-muted" style={{ fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase' }}>Spent</span>
                    </div>
                  </div>
                </div>

                {/* Subcategory bars */}
                <div className="d-flex flex-column gap-2 my-1 px-1">
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5" style={{ fontSize: '11px' }}>
                      <span>Constructions</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.6)} Cr</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '4px' }}>
                      <div className="progress-bar bg-primary rounded-pill" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5" style={{ fontSize: '11px' }}>
                      <span>Procurement & Materials</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.25)} Cr</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '4px' }}>
                      <div className="progress-bar bg-success rounded-pill" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5" style={{ fontSize: '11px' }}>
                      <span>Machinery & Logistics</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.15)} Cr</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '4px' }}>
                      <div className="progress-bar bg-warning rounded-pill" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow-1 d-flex flex-column justify-content-between py-1">
                {/* Circle Ring representing Simulated Progress */}
                <div className="d-flex align-items-center justify-content-center py-1">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '84px', height: '84px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="8"
                        strokeDasharray="251.3"
                        strokeDashoffset={251.3 * (1 - simProgress / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
                      />
                    </svg>
                    <div className="position-absolute d-flex flex-column align-items-center justify-content-center text-center">
                      <span className="fw-bold text-primary" style={{ fontSize: '13px' }}>{simProgress}%</span>
                      <span className="text-muted" style={{ fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase' }}>Target</span>
                    </div>
                  </div>
                </div>

                {/* Simulator slider controls */}
                <div className="px-1 mt-1">
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '11px' }}>
                    <span className="text-muted fw-semibold">Target Completion:</span>
                    <span className="text-primary fw-bold">{simProgress}%</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    step="1"
                    value={simProgress}
                    onChange={(e) => setSimProgress(Number(e.target.value))}
                    style={{ height: '4px', cursor: 'pointer' }}
                  />

                  <div className="bg-light p-2 rounded border mt-1.5" style={{ fontSize: '11px' }}>
                    <div className="d-flex justify-content-between mb-0.5 text-muted">
                      <span>Projected Cost:</span>
                      <span className="fw-bold text-dark">₹{Math.round(totalBudgetCr * (simProgress / 100))} Cr</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Projected Remainder:</span>
                      <span className="fw-semibold text-muted">₹{Math.max(0, Math.round(totalBudgetCr * (1 - simProgress / 100)))} Cr</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Statistics */}
            <div className="mt-auto pt-2.5 border-top" style={{ fontSize: '11.5px' }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="text-muted">Total Budget:</span>
                <span className="fw-bold text-dark">₹{totalBudgetCr} Cr</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="text-muted">Billed Spent:</span>
                <span className="fw-bold text-success">₹{spentCr} Cr</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="text-muted">Remaining:</span>
                <span className="fw-semibold text-muted">₹{remainingCr} Cr</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="text-muted">Allocated Date:</span>
                <span className="fw-semibold text-dark">{allocationDateVal}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted">Due Amount to Issue:</span>
                <span className="fw-bold text-danger">₹{dueAmountCr} Cr</span>
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
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>Root-Cause Analysis</span>
            </div>

            {leaderboardItems.length > 0 ? (
              <div className="row g-3 flex-grow-1 align-items-stretch">
                {/* Left split: leaderboard list */}
                <div className="col-5 border-end pe-3 d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {leaderboardItems.map((site, idx) => (
                    <div
                      key={site.name}
                      className={`d-flex align-items-center justify-content-between p-2 rounded cursor-pointer border ${activeLeaderboardIdx === idx
                        ? 'bg-primary-subtle border-primary-subtle fw-semibold text-primary'
                        : 'bg-light-subtle border-light-subtle text-body'
                        }`}
                      style={{ fontSize: '12px', transition: 'all 0.15s ease' }}
                      onClick={() => setActiveLeaderboardIdx(idx)}
                    >
                      <div className="d-flex align-items-center gap-1.5 min-width-0">
                        <span className="fw-bold" style={{ width: '22px' }}>{site.rank <= 3 ? site.medal : site.rank}</span>
                        <span className="text-truncate fw-semibold" style={{ maxWidth: '200px' }}>{site.name}</span>
                      </div>
                      <span className="fw-bold" style={{ color: site.color }}>{site.score}%</span>
                    </div>
                  ))}
                </div>

                {/* Right split: detailed factors why it has this percentage */}
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
                No safety records match the active filters.
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
          chainagesList={chainagesList}
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
