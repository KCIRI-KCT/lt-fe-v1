import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { InteractiveVectorMap } from '../../components/dashboard/InteractiveVectorMap';
import { PlanVsActualChart } from '../../components/charts/PlanVsActualChart';
import { KpiPopover } from '../../components/dashboard/KpiPopover';
import { RightDrawer } from '../../components/dashboard/RightDrawer';
import { StationDetailModal } from '../../components/dashboard/StationDetailModal';
import {
  MOCK_AI_ALERTS,
  MOCK_CHAINAGES,
  MOCK_PROJECTS,
  MOCK_SITES,
  MOCK_CAMERAS,
  MOCK_INCIDENTS,
} from '../../services/mockData';

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
];

const PLAN_VS_ACTUAL_YEARLY = [
  { month: '2022', planned: 10, actual: 10 },
  { month: '2023', planned: 28, actual: 27 },
  { month: '2024', planned: 56, actual: 52 },
  { month: '2025', planned: 85, actual: 80 },
  { month: '2026', planned: 100, actual: 95 },
];



export const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  // Filters dropdown state
  const [filterProject, setFilterProject] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterChainage, setFilterChainage] = useState('');

  // Applied filter state for mapping
  const [appliedProject, setAppliedProject] = useState('');
  const [appliedSite, setAppliedSite] = useState('');
  const [appliedChainage, setAppliedChainage] = useState('');


  // Plan vs Actual Chart toggle: week / month / year
  const [chartRange, setChartRange] = useState<'week' | 'month' | 'year'>('month');

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

  // Active leaderboard details index
  const [activeLeaderboardIdx, setActiveLeaderboardIdx] = useState<number>(0);

  // Operations console active tab state
  const [opsTab, setOpsTab] = useState<'materials' | 'machinery'>('materials');

  // ── FILTERED DATA COMPUTATIONS ──
  const activeChainages = MOCK_CHAINAGES.filter((ch) => {
    if (appliedProject && ch.project !== appliedProject) return false;
    if (appliedSite && ch.site !== appliedSite) return false;
    if (appliedChainage && ch.id !== appliedChainage) return false;
    return true;
  });

  const avgProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + ch.progress, 0) / activeChainages.length
    : 33.7;

  const avgSafetyScore = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + ch.safetyScore, 0) / activeChainages.length
    : 91.2;

  const avgHighwayProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + ch.highwayProgress, 0) / activeChainages.length
    : 45;

  const avgStructuralProgress = activeChainages.length > 0
    ? activeChainages.reduce((sum, ch) => sum + ch.structuralProgress, 0) / activeChainages.length
    : 40;

  // 1. Dynamic KPIs calculations
  const totalWorkersVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '2,680'
    : activeChainages.reduce((sum, ch) => sum + ch.workers, 0).toLocaleString('en-IN');

  const safetyScoreVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '91.2%'
    : `${avgSafetyScore.toFixed(1)}%`;

  const progressVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '33.7%'
    : `${avgProgress.toFixed(1)}%`;

  // Live Cameras computation
  const activeCameraList = MOCK_CAMERAS.filter((cam) => {
    if (appliedSite) {
      const siteObj = MOCK_SITES.find(s => s.name === appliedSite);
      return cam.siteId === siteObj?.id;
    }
    if (appliedProject) {
      const proj = MOCK_PROJECTS.find(p => p.name === appliedProject);
      const projSites = proj ? MOCK_SITES.filter(s => s.projectId === proj.id) : [];
      return projSites.some(s => s.id === cam.siteId);
    }
    return true;
  });

  const totalCams = appliedChainage
    ? (activeChainages[0]?.cameras || 0)
    : activeCameraList.length;
  const onlineCams = appliedChainage
    ? Math.max(0, totalCams - (activeChainages[0]?.status === 'red' ? 1 : 0))
    : activeCameraList.filter(c => c.status === 'online').length;
  const camerasVal = `${onlineCams} / ${totalCams}`;

  // Machinery
  const machineryVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '8'
    : activeChainages.reduce((sum, ch) => sum + ch.equipment, 0).toString();

  // AI Alerts
  const activeAlertsList = MOCK_AI_ALERTS.filter((alert) => {
    if (appliedChainage && alert.chainageId !== appliedChainage) return false;
    if (appliedSite) {
      const siteObj = MOCK_SITES.find(s => s.name === appliedSite);
      if (siteObj && alert.siteId !== siteObj.id) return false;
    }
    if (appliedProject) {
      const proj = MOCK_PROJECTS.find(p => p.name === appliedProject);
      const projSites = proj ? MOCK_SITES.filter(s => s.projectId === proj.id) : [];
      if (!projSites.some(s => s.id === alert.siteId)) return false;
    }
    return true;
  });
  const aiAlertsVal = activeAlertsList.length.toString();

  // Quality Audits
  const qualityAuditsVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '22'
    : (activeChainages.length * 4).toString();

  // Productivity
  const productivityScore = Math.min(100, Math.max(60, Math.round(80 + (avgSafetyScore - 70) * 0.5 + (avgProgress - 20) * 0.15)));
  const productivityVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '96.2%'
    : `${productivityScore}%`;

  // Schedule Delay
  const delayDays = avgProgress > 75 ? 0 : avgProgress > 50 ? 2 : avgProgress > 30 ? 4 : 7;
  const scheduleDelayVal = (!appliedProject && !appliedSite && !appliedChainage)
    ? '4 days'
    : delayDays === 0 ? '0 days' : `${delayDays} days`;
  const scheduleDelaySubtitle = (!appliedProject && !appliedSite && !appliedChainage)
    ? 'Critical baseline lag'
    : delayDays === 0 ? 'On Track' : delayDays <= 2 ? 'Recoverable delay' : 'Critical baseline lag';
  const scheduleDelayTrend = (!appliedProject && !appliedSite && !appliedChainage)
    ? 'Recoverable'
    : delayDays === 0 ? 'Excellent' : 'Action required';
  const scheduleDelayIsPositive = (!appliedProject && !appliedSite && !appliedChainage)
    ? false
    : delayDays === 0;

  // AI Server Health
  const hasRedStatus = activeChainages.some(ch => ch.status === 'red');
  const aiHealthVal = hasRedStatus ? 'Degraded' : 'Healthy';
  const aiHealthSubtitle = hasRedStatus ? 'Latency 180ms' : 'Latency 45ms avg';
  const aiHealthTrend = hasRedStatus ? 'Uptime 95%' : 'Uptime 99%';
  const aiHealthIsPositive = !hasRedStatus;

  // Active Incidents (additional KPI card to balance layout)
  const activeIncidentsList = MOCK_INCIDENTS.filter((inc) => {
    if (appliedSite) {
      const siteObj = MOCK_SITES.find(s => s.name === appliedSite);
      if (siteObj && inc.siteId !== siteObj.id) return false;
    }
    if (appliedProject) {
      const proj = MOCK_PROJECTS.find(p => p.name === appliedProject);
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
    { id: 'equipment', title: 'Machinery', value: machineryVal, subtitle: 'Heavy excavators/rigs', trend: '100% active', isPositive: true, icon: 'bi-gear-wide-connected', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
    { id: 'quality-inspections', title: 'Quality Audits', value: qualityAuditsVal, subtitle: 'Compaction / Cube logs', trend: 'Passed', isPositive: true, icon: 'bi-clipboard-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    // { id: 'safety-compliance', title: 'Safety Score', value: safetyScoreVal, subtitle: 'Average compliance', trend: '+0.8%', isPositive: true, icon: 'bi-shield-fill-check', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    // { id: 'live-cameras', title: 'Live Cameras', value: camerasVal, subtitle: 'Feed active status', trend: '93% uptime', isPositive: true, icon: 'bi-camera-video-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    { id: 'ai-alerts', title: 'AI Alerts', value: aiAlertsVal, subtitle: 'Pending review cases', trend: '-3 cases', isPositive: true, icon: 'bi-robot', badgeClass: 'bg-warning-subtle text-warning border border-warning-subtle' },
    // { id: 'daily-productivity', title: 'Productivity', value: productivityVal, subtitle: 'Laydown output score', trend: '+2.4%', isPositive: true, icon: 'bi-lightning-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    // { id: 'schedule-delay', title: 'Schedule Delay', value: scheduleDelayVal, subtitle: scheduleDelaySubtitle, trend: scheduleDelayTrend, isPositive: scheduleDelayIsPositive, icon: 'bi-clock-history', badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle' },
    // { id: 'ai-health', title: 'AI Server Health', value: aiHealthVal, subtitle: aiHealthSubtitle, trend: aiHealthTrend, isPositive: aiHealthIsPositive, icon: 'bi-cpu-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
    // { id: 'active-incidents', title: 'Active Incidents', value: incidentsVal, subtitle: 'Open hazard reviews', trend: incidentsTrend, isPositive: incidentsCount === 0, icon: 'bi-exclamation-triangle-fill', badgeClass: 'bg-warning-subtle text-warning border border-warning-subtle' },
    { id: 'ppe-compliance', title: 'PPE Compliance', value: safetyScoreVal, subtitle: 'Overall rate today', trend: '+0.5%', isPositive: true, icon: 'bi-person-check-fill', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
  ];



  // 2. Dynamic Safety Leaderboard logic
  let leaderboardTitle = 'Safety Leaderboard';
  let leaderboardItems: Array<{
    rank: number;
    name: string;
    score: number;
    icon: string;
    color: string;
    medal: string;
    isSelected?: boolean;
    details: { ppe: number; barricade: string; days: number; speed: number; violation: string; }
  }> = [];

  if (appliedChainage) {
    const selectedCh = MOCK_CHAINAGES.find(c => c.id === appliedChainage);
    leaderboardTitle = `Safety Leaderboard - ${selectedCh?.site || 'Site'}`;
    const siteChainages = MOCK_CHAINAGES.filter(c => c.site === selectedCh?.site)
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
    const siteChainages = MOCK_CHAINAGES.filter(c => c.site === appliedSite)
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
        details: safetyDetail
      };
    });
  } else if (appliedProject) {
    leaderboardTitle = `Safety Leaderboard - ${appliedProject}`;
    const projSites = MOCK_SITES.filter(s => s.projectName === appliedProject)
      .sort((a, b) => b.safetyScore - a.safetyScore);

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

  // 4. Cumulative Chart scaling function
  const getChartData = () => {
    let baseData = PLAN_VS_ACTUAL_MONTHLY;
    if (chartRange === 'week') baseData = PLAN_VS_ACTUAL_WEEKLY;
    else if (chartRange === 'year') baseData = PLAN_VS_ACTUAL_YEARLY;

    if (!appliedProject && !appliedSite && !appliedChainage) {
      return baseData;
    }

    const maxActualInBase = baseData[baseData.length - 1].actual;
    const scaleFactor = avgProgress / maxActualInBase;

    return baseData.map((d) => ({
      ...d,
      planned: Math.min(100, Math.round(d.planned * scaleFactor * 1.05)),
      actual: Math.min(100, Math.round(d.actual * scaleFactor)),
    }));
  };

  // 5. Dynamic Budget calculations
  let totalBudgetCr = 1050;
  let spentCr = 342;
  let spentPct = 32.5;

  const matchedProject = MOCK_PROJECTS.find(p => p.name === appliedProject);
  if (matchedProject) {
    const projectBudgetCr = matchedProject.budget / 10000000;

    if (appliedChainage) {
      const siteCount = MOCK_SITES.filter(s => s.projectId === matchedProject.id).length || 1;
      totalBudgetCr = Math.round(projectBudgetCr / (siteCount * 2));
    } else if (appliedSite) {
      const siteCount = MOCK_SITES.filter(s => s.projectId === matchedProject.id).length || 1;
      totalBudgetCr = Math.round(projectBudgetCr / siteCount);
    } else {
      totalBudgetCr = Math.round(projectBudgetCr);
    }

    spentPct = Math.min(100, Math.round(avgProgress * 0.95 * 10) / 10);
    spentCr = Math.round(totalBudgetCr * (spentPct / 100));
  } else {
    totalBudgetCr = 1050;
    spentPct = 32.5;
    spentCr = Math.round(totalBudgetCr * (spentPct / 100));
  }
  const remainingCr = totalBudgetCr - spentCr;
  const allocationDateVal = matchedProject
    ? new Date(matchedProject.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '01 Jan 2024';
  const dueAmountCr = Math.round(remainingCr * 0.12 * 10) / 10;

  // Sync slider target completion whenever filters adjust the spentPct
  useEffect(() => {
    setSimProgress(spentPct);
  }, [spentPct]);

  // 6. Dynamic AI Alerts list
  const filteredAlerts = MOCK_AI_ALERTS.filter((alert) => {
    if (appliedChainage) return alert.chainageId === appliedChainage;
    if (appliedSite) {
      const siteObj = MOCK_SITES.find(s => s.name === appliedSite);
      return siteObj && alert.siteId === siteObj.id;
    }
    if (appliedProject) {
      const proj = MOCK_PROJECTS.find(p => p.name === appliedProject);
      const projSites = proj ? MOCK_SITES.filter(s => s.projectId === proj.id) : [];
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

  const handleMapAction = (type: 'dashboard' | 'camera' | 'report' | 'details', chainage: string) => {
    if (type === 'details') {
      setActiveStationId(chainage);
    } else if (type === 'camera') {
      navigate('/cameras');
    } else if (type === 'report') {
      navigate('/reports');
    } else {
      navigate('/health');
    }
  };

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
    <div
      className="container-fluid px-4 py-3 d-flex flex-column gap-3"
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'var(--admin-bg, #f5f7fb)',
        fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
      }}
    >
      {/* ── 1. Greeting & Top Horizontal Action Bar (Velzon/Aurora style) ── */}
      <section className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <h2 className="h4 mb-0 fw-bold text-body">Good Morning, {user?.name}!</h2>
          <p className="text-muted mb-0 small">Here's a comprehensive real-time status of your construction sites today.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Weather Widget */}
          {/* <div className="badge bg-white text-secondary border px-3 py-2 d-flex align-items-center gap-1.5 shadow-sm">
            <span role="img" aria-label="sun">☀️</span>
            <span className="fw-semibold">32°C Chennai</span>
          </div> */}

          {/* AI Server Status Indicator */}
          {/* <div className="badge bg-white text-secondary border px-3 py-2 d-flex align-items-center gap-1.5 shadow-sm">
            <span className="status-dot bg-success" style={{ width: 8, height: 8 }} />
            <span className="fw-semibold text-muted">AI inference: Active</span>
          </div> */}

          {/* Notifications button */}
          <button
            className="btn btn-white border bg-white position-relative shadow-sm py-1.5 px-3 text-secondary"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Alerts Drawer"
          >
            <span className="notification-dot bg-danger" style={{ width: 6, height: 6, position: 'absolute', top: 8, right: 12 }} />
            <i className="bi bi-bell-fill me-1.5 text-primary" />
            <span>Notification Center ({MOCK_AI_ALERTS.length})</span>
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
              <option value="Chennai-Bangalore Expressway">Chennai Expressway</option>
              <option value="Mumbai Ring Road">Mumbai Ring Road</option>
              <option value="Hyderabad Metro Phase II">Hyderabad Metro II</option>
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
                  if (['Site A - KM 0-15', 'Site B - KM 15-30', 'Site C - KM 30-45'].includes(selectedVal)) {
                    setFilterProject('Chennai-Bangalore Expressway');
                  } else if (['Site D - KM 0-12', 'Site E - KM 12-25'].includes(selectedVal)) {
                    setFilterProject('Mumbai Ring Road');
                  } else if (['Site F - KM 0-12', 'Site G - KM 12-25'].includes(selectedVal)) {
                    setFilterProject('Hyderabad Metro Phase II');
                  }
                }
              }}
            >
              <option value="">All Sites</option>
              {(!filterProject || filterProject === 'Chennai-Bangalore Expressway') && (
                <>
                  <option value="Site A - KM 0-15">Site A - KM 0-15</option>
                  <option value="Site B - KM 15-30">Site B - KM 15-30</option>
                  <option value="Site C - KM 30-45">Site C - KM 30-45</option>
                </>
              )}
              {(!filterProject || filterProject === 'Mumbai Ring Road') && (
                <>
                  <option value="Site D - KM 0-12">Site D - KM 0-12</option>
                  <option value="Site E - KM 12-25">Site E - KM 12-25</option>
                </>
              )}
              {(!filterProject || filterProject === 'Hyderabad Metro Phase II') && (
                <>
                  <option value="Site F - KM 0-12">Site F - KM 0-12</option>
                  <option value="Site G - KM 12-25">Site G - KM 12-25</option>
                </>
              )}
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
              {filterSite === 'Site A - KM 0-15' && (
                <>
                  <option value="CH-01">CH-01 (KM 2.5)</option>
                  <option value="CH-05">CH-05 (KM 12.0)</option>
                </>
              )}
              {filterSite === 'Site B - KM 15-30' && <option value="CH-10">CH-10 (KM 22.4)</option>}
              {filterSite === 'Site C - KM 30-45' && <option value="CH-15">CH-15 (KM 38.2)</option>}
              {filterSite === 'Site D - KM 0-12' && <option value="CH-20">CH-20 (KM 4.8)</option>}
              {filterSite === 'Site E - KM 12-25' && <option value="CH-25">CH-25 (KM 16.5)</option>}
              {filterSite === 'Site F - KM 0-12' && (
                <>
                  <option value="CH-30">CH-30 (KM 2.5)</option>
                  <option value="CH-35">CH-35 (KM 12.0)</option>
                </>
              )}
              {filterSite === 'Site G - KM 12-25' && <option value="CH-40">CH-40 (KM 22.4)</option>}
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
                <span className="small text-muted fw-bold text-uppercase text-truncate" style={{ fontSize: '10px', letterSpacing: '0.3px', maxWidth: '100px' }}>
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
              selectedProject={appliedProject}
              selectedSite={appliedSite}
              selectedChainage={appliedChainage}
              onActionClick={handleMapAction}
            />
          </div>
        </div>

        {/* Plan vs Actual Progress Chart */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '340px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-1.5">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up-arrow text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">Plan vs Actual Cumulative Progress</h3>
              </div>
              <div className="btn-group d-flex align-items-center" >
                <button
                  className={`btn btn-xs py-1 px-3 ${chartRange === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setChartRange('week')}
                >
                  Week
                </button>
                <button
                  className={`btn btn-xs py-1 px-3 ${chartRange === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setChartRange('month')}
                >
                  Month
                </button>
                <button
                  className={`btn btn-xs py-1 px-3 ${chartRange === 'year' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setChartRange('year')}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
              <PlanVsActualChart data={getChartData()} />
            </div>
          </div>
        </div>

        {/* Budget Burn Card */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '340px' }}>
            {/* Header Tabs */}
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-wallet2 text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">Budget Burn</h3>
              </div>
              {/* <div className="btn-group">
                <button
                  type="button"
                  className={`btn btn-xs py-0.5 px-2 ${budgetTab === 'summary' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '9px', padding: '2px 6px' }}
                  onClick={() => setBudgetTab('summary')}
                >
                  Summary
                </button>
                <button
                  type="button"
                  className={`btn btn-xs py-0.5 px-2 ${budgetTab === 'simulator' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '9px', padding: '2px 6px' }}
                  onClick={() => setBudgetTab('simulator')}
                >
                  Forecast
                </button>
              </div> */}
            </div>

            {budgetTab === 'summary' ? (
              <div className="flex-grow-1 d-flex flex-column justify-content-between py-1">
                {/* Circle Ring */}
                <div className="d-flex align-items-center justify-content-center py-2">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px' }}>
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
                      <span className="fw-bold text-body">{spentPct}%</span>
                      <span className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Spent</span>
                    </div>
                  </div>
                </div>

                {/* Subcategory bars */}
                <div className="d-flex flex-column gap-2 mt-1">
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5">
                      <span>Constructions</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.6)} Cr</span>
                    </div>
                    <div className="progress" style={{ height: '3px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5">
                      <span>Procurement & Materials</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.25)} Cr</span>
                    </div>
                    <div className="progress" style={{ height: '3px' }}>
                      <div className="progress-bar bg-success" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between text-muted mb-0.5">
                      <span>Machinery & Logistics</span>
                      <span className="fw-semibold text-dark">₹{Math.round(spentCr * 0.15)} Cr</span>
                    </div>
                    <div className="progress" style={{ height: '3px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow-1 d-flex flex-column justify-content-between py-1">
                {/* Circle Ring representing Simulated Progress */}
                <div className="d-flex align-items-center justify-content-center py-2">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px' }}>
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
                      <span className="fw-bold text-primary">{simProgress}%</span>
                      <span className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Target</span>
                    </div>
                  </div>
                </div>

                {/* Simulator slider controls */}
                <div className="px-1 mt-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted fw-semibold">Simulation Target Completion:</span>
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

                  <div className="bg-light p-2 rounded border mt-2">
                    <div className="d-flex justify-content-between mb-1 text-muted">
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
            <div className="mt-auto pt-2 border-top">
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
                No safety records match the active filters.
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Operations & Material Console */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-3 bg-white h-100 d-flex flex-column" style={{ minHeight: '380px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-cpu text-primary fs-5" />
                <h3 className="h6 mb-0 fw-bold">Operations & Material Console</h3>
              </div>
              <div className="btn-group">
                <button
                  type="button"
                  className={`btn btn-xs py-1 px-2.5 ${opsTab === 'materials' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '10px' }}
                  onClick={() => setOpsTab('materials')}
                >
                  Materials
                </button>
                <button
                  type="button"
                  className={`btn btn-xs py-1 px-2.5 ${opsTab === 'machinery' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '10px' }}
                  onClick={() => setOpsTab('machinery')}
                >
                  Machinery
                </button>
              </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              {opsTab === 'materials' && (
                <div className="d-grid gap-3" style={{ fontSize: '12.5px' }}>
                  {/* Cement */}
                  <div>
                    <div className="d-flex justify-content-between mb-0.5">
                      <span className="text-body fw-medium">Cement Stock (Grade 53)</span>
                      <span className="text-muted fw-bold">1,450 / 2,000 Bags <span className="badge bg-success-subtle text-success ms-1">72%</span></span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" style={{ width: '72%' }} />
                    </div>
                    <small className="text-muted" style={{ fontSize: '10.5px' }}>Estimated exhaustion: 7 days remaining</small>
                  </div>

                  {/* Rebar Steel */}
                  <div>
                    <div className="d-flex justify-content-between mb-0.5">
                      <span className="text-body fw-medium">Rebar Reinforcement Steel</span>
                      <span className="text-muted fw-bold">18.5 / 25.0 Tons <span className="badge bg-success-subtle text-success ms-1">74%</span></span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" style={{ width: '74%' }} />
                    </div>
                    <small className="text-muted" style={{ fontSize: '10.5px' }}>Estimated exhaustion: 5 days remaining</small>
                  </div>

                  {/* Coarse Aggregate */}
                  <div>
                    <div className="d-flex justify-content-between mb-0.5">
                      <span className="text-body fw-medium">Coarse / Fine Aggregates</span>
                      <span className="text-muted fw-bold">780 / 1,200 m³ <span className="badge bg-primary-subtle text-primary ms-1">65%</span></span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '65%' }} />
                    </div>
                    <small className="text-muted" style={{ fontSize: '10.5px' }}>Estimated exhaustion: 12 days remaining</small>
                  </div>

                  {/* Diesel Fuel */}
                  <div>
                    <div className="d-flex justify-content-between mb-0.5">
                      <span className="text-body fw-medium">Diesel Machinery Fuel Tank</span>
                      <span className="text-muted fw-bold">3,100 / 4,000 L <span className="badge bg-success-subtle text-success ms-1">77%</span></span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" style={{ width: '77%' }} />
                    </div>
                    <small className="text-muted" style={{ fontSize: '10.5px' }}>Estimated exhaustion: 4 days remaining</small>
                  </div>
                </div>
              )}



              {opsTab === 'machinery' && (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {[
                    { tag: 'Excavator EX-04', status: 'Running', detail: 'Consumption: 14.2 L/hr | Safe Speed: OK', badge: 'bg-success-subtle text-success border' },
                    { tag: 'Piling Rig PR-02', status: 'Running', detail: 'Drill Depth: 18.5m | Safe Perimeter: OK', badge: 'bg-success-subtle text-success border' },
                    { tag: 'Crawler Crane CC-01', status: 'Idle', detail: 'Awaiting aggregate concrete layout delivery', badge: 'bg-warning-subtle text-warning border' },
                    { tag: 'Dumper Truck DT-11', status: 'Moving', detail: 'Speed: 24 km/h | Fuel level: 82% | GPS Locked', badge: 'bg-success-subtle text-success border' }
                  ].map((m, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded border bg-light-subtle" style={{ fontSize: '12.5px' }}>
                      <div>
                        <div className="fw-semibold text-dark">{m.tag}</div>
                        <small className="text-muted">{m.detail}</small>
                      </div>
                      <span className={`badge ${m.badge} p-1.5 fw-bold`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* ── 6. Floating Popover Modal & Alerts Drawer Overlay ── */}
      {activeKpiCardId && (
        <KpiPopover cardId={activeKpiCardId} onClose={() => setActiveKpiCardId(null)} />
      )}

      {activeStationId && (
        <StationDetailModal stationId={activeStationId} onClose={() => setActiveStationId(null)} />
      )}

      <RightDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
