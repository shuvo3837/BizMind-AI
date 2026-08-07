import { sendSuccess } from '../utils/apiResponse.js';

export const generateReport = async (req, res) => {
  const { reportType, title } = req.body;

  const newReport = {
    id: 'rep_' + Date.now(),
    title: title || `${reportType || 'Executive'} Performance Analysis`,
    reportType: reportType || 'Executive Summary',
    generatedAt: new Date().toISOString(),
    summary: 'Comprehensive business metrics audit highlighting strong 14.2% MoM revenue growth, sustainable 66% gross margins, and strategic inventory reordering recommendations.',
    sections: [
      {
        heading: 'Executive Financial Summary',
        content: 'Gross revenue reached $184,500 in the current cycle, outperforming the $150,000 monthly target by 23%. Net operating margin stood resilient at 66.2%.',
        keyTakeaways: ['MoM Revenue up +14.2%', 'Net profit reached $122,200', 'Target exceeded by $34,500']
      },
      {
        heading: 'Operational & Expense Breakdown',
        content: 'Operational expenses totaled $62,300. Primary cost drivers include digital marketing acquisition ($24,000) and infrastructure overhead ($18,500).',
        keyTakeaways: ['Marketing CAC stabilized at $42.50', 'Infra costs scaled efficiently']
      }
    ],
    downloadUrl: '#'
  };

  return sendSuccess(res, 'Report generated successfully', newReport, 201);
};

export const getReportsList = async (req, res) => {
  const reports = [
    {
      id: 'rep_101',
      title: 'Q2 Executive Growth Audit',
      reportType: 'Executive Summary',
      generatedAt: '2026-08-01T10:00:00.000Z',
      downloadUrl: '#'
    },
    {
      id: 'rep_102',
      title: 'July Financial & Expense Review',
      reportType: 'Financial Performance',
      generatedAt: '2026-08-05T15:30:00.000Z',
      downloadUrl: '#'
    }
  ];

  return sendSuccess(res, 'Reports retrieved', reports);
};
