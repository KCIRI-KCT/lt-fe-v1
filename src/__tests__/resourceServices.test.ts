import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import projectService from '../services/projectService';
import siteService from '../services/siteService';
import workerService from '../services/workerService';
import safetyService from '../services/safetyService';
import messageService from '../services/messageService';
import reportService from '../services/reportService';
import employeeService from '../services/employeeService';

vi.mock('../services/api', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockAxios };
});

describe('RESTful Model Resource ViewSets (DRF standard CRUD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Projects
  it('should handle all projectService CRUD endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: '1', name: 'Kochi Expressway' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: '1', name: 'Kochi Expressway' } } });
    (api.post as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: { id: '2', name: 'New Proj' } } })
      .mockResolvedValueOnce({ data: { message: 'Deletion requested' } });
    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: '1', name: 'Updated' } } });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Deleted' } });

    const projects = await projectService.getProjects({ search: 'Kochi' });
    expect(projects[0].name).toBe('Kochi Expressway');

    const proj = await projectService.getProject('1');
    expect(proj.name).toBe('Kochi Expressway');

    const created = await projectService.createProject({ name: 'New Proj' });
    expect(created.name).toBe('New Proj');

    const updated = await projectService.updateProject('1', { name: 'Updated' });
    expect(updated.name).toBe('Updated');

    const reqDel = await projectService.requestDeleteProject('1', 'Reason');
    expect(reqDel.message).toBe('Deletion requested');

    const del = await projectService.confirmDeleteProject('1');
    expect(del.message).toBe('Deleted');
  });

  // 2. Sites & Location Data
  it('should handle all siteService CRUD and location endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: '10', name: 'Site A' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: '10', name: 'Site A' } } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'ch-1', name: 'KM 45' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: '1', name: 'India' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: '1', name: 'Tamil Nadu' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: '1', name: 'Chennai' }] } });

    (api.post as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: { id: '11', name: 'New Site' } } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'ch-2', name: 'KM 46' } } });

    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: '10', name: 'Updated Site' } } });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Site deleted' } });

    const sites = await siteService.getSites({ projectId: '1' });
    expect(sites[0].name).toBe('Site A');

    const site = await siteService.getSite('10');
    expect(site.name).toBe('Site A');

    const createdSite = await siteService.createSite({ name: 'New Site' });
    expect(createdSite.name).toBe('New Site');

    const updatedSite = await siteService.updateSite('10', { name: 'Updated Site' });
    expect(updatedSite.name).toBe('Updated Site');

    const deleted = await siteService.deleteSite('10');
    expect(deleted.message).toBe('Site deleted');

    const chainages = await siteService.getChainages('10');
    expect(chainages[0].name).toBe('KM 45');

    const createdChainage = await siteService.createChainage({ name: 'KM 46' });
    expect(createdChainage.name).toBe('KM 46');

    const countries = await siteService.getCountries();
    expect(countries[0].name).toBe('India');

    const states = await siteService.getStates('1');
    expect(states[0].name).toBe('Tamil Nadu');

    const cities = await siteService.getCities('1');
    expect(cities[0].name).toBe('Chennai');
  });

  // 3. Workers & Attendance
  it('should handle all workerService CRUD and attendance endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'w1', name: 'Ramesh' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'w1', name: 'Ramesh' } } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'att-1', date: '2026-08-17' }] } });

    (api.post as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'w2', name: 'Suresh' } } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'att-2', status: 'present' } } });

    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: 'w1', name: 'Updated Ramesh' } } });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Worker deleted' } });

    const workers = await workerService.getWorkers({ siteId: '10' });
    expect(workers[0].name).toBe('Ramesh');

    const worker = await workerService.getWorker('w1');
    expect(worker.name).toBe('Ramesh');

    const created = await workerService.createWorker({ name: 'Suresh' });
    expect(created.name).toBe('Suresh');

    const updated = await workerService.updateWorker('w1', { name: 'Updated Ramesh' });
    expect(updated.name).toBe('Updated Ramesh');

    const del = await workerService.deleteWorker('w1');
    expect(del.message).toBe('Worker deleted');

    const attendances = await workerService.getAttendances({ siteId: '10' });
    expect(attendances[0].date).toBe('2026-08-17');

    const createdAtt = await workerService.createAttendance({ status: 'present' });
    expect(createdAtt.status).toBe('present');
  });

  // 4. Safety & Incidents
  it('should handle all safetyService endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'alt-1', description: 'No Helmet' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'ppe-1', alertId: 'alt-1' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'inc-1', title: 'Leak' }] } });

    (api.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: 'alt-1', status: 'resolved' } } });
    (api.post as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'ack-1' } } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'inc-2', title: 'Fire Hazard' } } });

    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: 'inc-1', title: 'Updated Leak' } } });

    const alerts = await safetyService.getAIAlerts({ status: 'open' });
    expect(alerts[0].description).toBe('No Helmet');

    const updatedAlert = await safetyService.updateAIAlertStatus('alt-1', 'resolved');
    expect(updatedAlert.status).toBe('resolved');

    const ack = await safetyService.acknowledgePPE({ alertId: 'alt-1' });
    expect(ack.id).toBe('ack-1');

    const ppeNotifs = await safetyService.getPPENotifications();
    expect(ppeNotifs[0].id).toBe('ppe-1');

    const incidents = await safetyService.getIncidents();
    expect(incidents[0].title).toBe('Leak');

    const createdInc = await safetyService.createIncident({ title: 'Fire Hazard' });
    expect(createdInc.title).toBe('Fire Hazard');

    const updatedInc = await safetyService.updateIncident('inc-1', { title: 'Updated Leak' });
    expect(updatedInc.title).toBe('Updated Leak');
  });

  // 5. Messages
  it('should handle all messageService endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'msg-1', subject: 'Toolbox Talk' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: { id: 'msg-1', subject: 'Toolbox Talk' } } });
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: 'msg-2', subject: 'New Alert' } } });
    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { id: 'msg-1', subject: 'Updated Talk' } } });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Message deleted' } });

    const msgs = await messageService.getMessages();
    expect(msgs[0].subject).toBe('Toolbox Talk');

    const msg = await messageService.getMessage('msg-1');
    expect(msg.subject).toBe('Toolbox Talk');

    const created = await messageService.createMessage({ subject: 'New Alert' });
    expect(created.subject).toBe('New Alert');

    const updated = await messageService.updateMessage('msg-1', { subject: 'Updated Talk' });
    expect(updated.subject).toBe('Updated Talk');

    const del = await messageService.deleteMessage('msg-1');
    expect(del.message).toBe('Message deleted');
  });

  // 6. Reports
  it('should handle all reportService endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 'rep-1', title: 'Daily Report' }] } })
      .mockResolvedValueOnce({ data: new Blob(['pdf bytes']) });

    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'rep-2', title: 'Generated Report' } },
    });

    const reports = await reportService.getReports();
    expect(reports[0].title).toBe('Daily Report');

    const gen = await reportService.generateReport({ type: 'safety', dateRange: { start: '2026-08-01', end: '2026-08-17' }, format: 'pdf' });
    expect(gen.title).toBe('Generated Report');

    const blob = await reportService.downloadReport('rep-1');
    expect(blob).toBeInstanceOf(Blob);
  });

  // 7. Employees
  it('should handle all employeeService endpoints', async () => {
    (api.get as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { success: true, data: [{ employee_id: 101, employee_code: 'EMP1001', employee_name: 'John Doe', designation: 'Engineer' }] } })
      .mockResolvedValueOnce({ data: { success: true, data: { employee_id: 101, employee_name: 'John Doe' } } });

    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { employee_id: 102, employee_name: 'Jane' } } });
    (api.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true, data: { employee_id: 101, employee_name: 'John Smith' } } });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { message: 'Employee deleted' } });

    const employees = await employeeService.getEmployees();
    expect(employees[0].name).toBe('John Doe');

    const emp = await employeeService.getEmployee('101');
    expect(emp.employee_name).toBe('John Doe');

    const created = await employeeService.createEmployee({ employee_name: 'Jane' });
    expect(created.employee_name).toBe('Jane');

    const updated = await employeeService.updateEmployee('101', { employee_name: 'John Smith' });
    expect(updated.employee_name).toBe('John Smith');

    const del = await employeeService.deleteEmployee('101');
    expect(del.message).toBe('Employee deleted');
  });
});
