import express from 'express';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import Event from '../../../shared/models/eventModel.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  try {
    // adapt according to your auth middleware earlier
    const user = req.user;
    if (!user || !(user.role === 'admin' || user.isAdmin)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch {
    return res.status(403).json({ message: 'Forbidden' });
  }
}

router.get('/events/export', requireAdmin, async (req, res) => {
  try {
    const { format = 'csv', start, end, status, department, coordinator } = req.query;

    const q = {};
    if (status) q.status = status;
    const ors = [];
    if (department) {
      ors.push({ 'organizingDepartments.primary': { $regex: new RegExp(`^${department}$`, 'i') } });
      ors.push({ 'organizingDepartments.associative': { $elemMatch: { $regex: new RegExp(`^${department}$`, 'i') } } });
    }
    if (coordinator) {
      ors.push({ 'coordinators.name': { $regex: new RegExp(coordinator, 'i') } });
      ors.push({ 'coordinatorId.name': { $regex: new RegExp(coordinator, 'i') } });
    }
    if (ors.length) q.$or = ors;

    if (start || end) {
      q.startDate = {};
      if (start) q.startDate.$gte = new Date(start + 'T00:00:00');
      if (end) q.startDate.$lte = new Date(end + 'T23:59:59.999');
    }

    const cursor = Event.find(q).sort({ startDate: 1 }).cursor();

    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="event_history_${new Date().toISOString().slice(0,10)}.xlsx"`);

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
      const ws = workbook.addWorksheet('Events');

      ws.columns = [
        { header: 'Event ID', key: '_id', width: 20 },
        { header: 'Title', key: 'title', width: 40 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Mode', key: 'mode', width: 12 },
        { header: 'Venue', key: 'venue', width: 20 },
        { header: 'Departments', key: 'departments', width: 30 },
        { header: 'Coordinators', key: 'coordinators', width: 30 },
        { header: 'Start', key: 'start', width: 20 },
        { header: 'End', key: 'end', width: 20 },
        { header: 'Duration', key: 'duration', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Created By', key: 'createdBy', width: 24 },
        { header: 'Budget', key: 'budget', width: 12 },
        { header: 'Total Income', key: 'totalIncome', width: 14 },
        { header: 'Total Expenditure', key: 'totalExp', width: 16 },
        { header: 'Claim Total Expenditure', key: 'claimTotalExp', width: 18 },
        { header: 'Claim Total Approved', key: 'claimTotalApproved', width: 18 },
        { header: 'Committee Size', key: 'committeeSize', width: 12 },
        { header: 'Short Notes', key: 'shortNotes', width: 40 },
      ];

      for await (const doc of cursor) {
        const departments = [doc.organizingDepartments?.primary, ...(doc.organizingDepartments?.associative || [])].filter(Boolean).join(', ');
        const coordinators = (doc.coordinators || []).map(c => `${c.name}${c.designation ? ' ('+c.designation+')' : ''}`).join(', ') || (doc.coordinatorId?.name || '');
        const createdBy = doc.createdBy?.name || doc.createdBy?.email || '';
        ws.addRow({
          _id: doc._id.toString(),
          title: doc.title || '',
          type: doc.type || '',
          mode: doc.mode || '',
          venue: doc.venue || '',
          departments,
          coordinators,
          start: doc.startDate ? doc.startDate.toISOString().replace('T',' ').slice(0,16) : '',
          end: doc.endDate ? doc.endDate.toISOString().replace('T',' ').slice(0,16) : '',
          duration: doc.duration || '',
          status: doc.status || '',
          createdAt: doc.createdAt ? doc.createdAt.toISOString().replace('T',' ').slice(0,16) : '',
          createdBy,
          budget: doc.budget ?? 0,
          totalIncome: doc.budgetBreakdown?.totalIncome ?? 0,
          totalExp: doc.budgetBreakdown?.totalExpenditure ?? 0,
          claimTotalExp: doc.claimBill?.totalExpenditure ?? 0,
          claimTotalApproved: doc.claimBill?.totalApprovedAmount ?? 0,
          committeeSize: (doc.organizingCommittee || []).length,
          shortNotes: (doc.reviewComments || '').replace(/\s+/g,' ').trim().slice(0,200)
        }).commit();
      }

      await workbook.commit();
      return;
    }

    // CSV default
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event_history_${new Date().toISOString().slice(0,10)}.csv"`);

    const headers = [
      'Event ID','Title','Type','Mode','Venue',
      'Departments','Coordinators','Start','End','Duration',
      'Status','Created At','Created By','Budget','TotalIncome','TotalExpenditure',
      'ClaimTotalExpenditure','ClaimTotalApproved','CommitteeSize','ShortNotes'
    ];
    res.write(headers.join(',') + '\n');

    for await (const doc of cursor) {
      const departments = [doc.organizingDepartments?.primary, ...(doc.organizingDepartments?.associative || [])].filter(Boolean).join(', ');
      const coordinators = (doc.coordinators || []).map(c => `${c.name}${c.designation ? ' ('+c.designation+')' : ''}`).join(', ') || (doc.coordinatorId?.name || '');
      const createdBy = doc.createdBy?.name || doc.createdBy?.email || '';
      const shortNotes = (doc.reviewComments || '').replace(/\s+/g,' ').trim().slice(0,200);

      const row = [
        `"${doc._id.toString()}"`,
        `"${(doc.title || '').replace(/"/g,'""')}"`,
        `"${(doc.type || '')}"`,
        `"${(doc.mode || '')}"`,
        `"${(doc.venue || '')}"`,
        `"${departments.replace(/"/g,'""')}"`,
        `"${coordinators.replace(/"/g,'""')}"`,
        `"${doc.startDate ? doc.startDate.toISOString().replace('T',' ').slice(0,16) : ''}"`,
        `"${doc.endDate ? doc.endDate.toISOString().replace('T',' ').slice(0,16) : ''}"`,
        `"${(doc.duration || '')}"`,
        `"${(doc.status || '')}"`,
        `"${doc.createdAt ? doc.createdAt.toISOString().replace('T',' ').slice(0,16) : ''}"`,
        `"${createdBy.replace(/"/g,'""')}"`,
        `${Number(doc.budget ?? 0).toFixed(2)}`,
        `${Number(doc.budgetBreakdown?.totalIncome ?? 0).toFixed(2)}`,
        `${Number(doc.budgetBreakdown?.totalExpenditure ?? 0).toFixed(2)}`,
        `${Number(doc.claimBill?.totalExpenditure ?? 0).toFixed(2)}`,
        `${Number(doc.claimBill?.totalApprovedAmount ?? 0).toFixed(2)}`,
        `${(doc.organizingCommittee || []).length}`,
        `"${shortNotes.replace(/"/g,'""')}"`
      ];
      res.write(row.join(',') + '\n');
    }

    res.end();
  } catch (err) {
    console.error('Export error', err);
    if (!res.headersSent) res.status(500).json({ message: 'Export failed' });
    else res.end();
  }
});

export default router;
