import type { NavItem } from '../types';

export const getNavItemsForRole = (role: string): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        { label: 'System Health', path: '/health', icon: 'bi bi-cpu-fill' },
        {
          label: 'Camera',
          path: '/cameras',
          icon: 'bi bi-camera-video-fill',
          children: [
            { label: 'All Cameras', path: '/cameras', icon: 'bi bi-card-list' },
            { label: 'Add Camera', path: '/cameras/create', icon: 'bi bi-plus-circle-fill' },
            { label: 'Update Camera', path: '/cameras/edit', icon: 'bi bi-pencil-fill' },
            { label: 'Remove Camera', path: '/cameras/delete', icon: 'bi bi-trash-fill' },
          ]
        },
        {
          label: 'Project Management',
          path: '/projects',
          icon: 'bi bi-building-fill',
          children: [
            { label: 'All Projects', path: '/projects', icon: 'bi bi-card-list' },
            { label: 'Add Project', path: '/projects/create', icon: 'bi bi-plus-circle-fill' },
            { label: 'Update Project', path: '/projects/edit', icon: 'bi bi-pencil-fill' },
            { label: 'Delete Request', path: '/projects/delete', icon: 'bi bi-trash-fill' },
          ]
        },
        {
          label: 'User Management',
          path: '/users',
          icon: 'bi bi-person-badge-fill',
          children: [
            { label: 'All Users', path: '/users', icon: 'bi bi-card-list' },
            { label: 'Add User', path: '/users/create', icon: 'bi bi-person-plus-fill' },
            { label: 'Update User', path: '/users/edit', icon: 'bi bi-pencil-fill' },
            { label: 'Remove User', path: '/users/delete', icon: 'bi bi-trash-fill' },
          ]
        },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    case 'project_manager':
      return [
        { label: 'Executive Dashboard', path: '/project-manager', icon: 'bi bi-speedometer2' },
        { label: 'Progress', path: '/progress', icon: 'bi bi-bar-chart-steps' },
        { label: 'Reports', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
        { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
        { label: 'Alerts', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    case 'site_supervisor':
      return [
        { label: 'Executive Dashboard', path: '/project-manager', icon: 'bi bi-speedometer2' },
<<<<<<< HEAD
        // { label: 'Progress', path: '/progress', icon: 'bi bi-bar-chart-steps' },
=======
        { label: 'Progress', path: '/progress', icon: 'bi bi-bar-chart-steps' },
>>>>>>> MS-ltfe-report
        { label: 'Reports', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
        { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
        { label: 'Alerts', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    case 'site_engineer':
      return [
        { label: 'Live Monitoring', path: '/site-engineer', icon: 'bi bi-speedometer2' },
<<<<<<< HEAD
        // { label: 'Progress', path: '/progress', icon: 'bi bi-bar-chart-steps' },
        { label: 'Alerts', path: '/ai-monitoring', icon: 'bi bi-activity' },
=======
        { label: 'Progress', path: '/progress', icon: 'bi bi-bar-chart-steps' },
        { label: 'Activity Recognition', path: '/ai-monitoring', icon: 'bi bi-activity' },
>>>>>>> MS-ltfe-report
        { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
        { label: 'Reports', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    case 'safety_manager':
      return [
        { label: 'PPE Detection', path: '/ppe-detection', icon: 'bi bi-shield-fill-check' },
        { label: 'Intrusion Detection', path: '/intrusion-detection', icon: 'bi bi-shield-exclamation' },
        { label: 'Alerts', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
        { label: 'Camera', path: '/cameras', icon: 'bi bi-camera-video-fill' },
        { label: 'Reports', path: '/reports', icon: 'bi bi-file-earmark-bar-graph-fill' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    case 'safety_officer':
      return [
        { label: 'PPE Dashboard', path: '/safety-officer', icon: 'bi bi-shield-fill-check' },
        { label: 'PPE Detection', path: '/ppe-detection', icon: 'bi bi-person-check-fill' },
        { label: 'Intrusion Detection', path: '/intrusion-detection', icon: 'bi bi-shield-exclamation' },
        { label: 'Alerts', path: '/ai-monitoring', icon: 'bi bi-bell-fill' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];

    default:
      return [
        { label: 'Dashboard', path: '/health', icon: 'bi bi-speedometer' },
        { label: 'Message', path: '/messages', icon: 'bi bi-chat-left-text-fill' }
      ];
  }
};

export const getFirstSidebarRoute = (role?: string): string => {
  if (!role) return '/health';
  const navItems = getNavItemsForRole(role);
  return navItems[0]?.path || '/health';
};
