import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all reports
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: '获取报告列表失败' }, { status: 500 });
  }
}

// POST create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, basicSummary, fullContent, formJson, status, publishAt } = body;

    const report = await prisma.report.create({
      data: {
        title,
        basicSummary: basicSummary || '',
        fullContent: fullContent || '',
        formJson: formJson || '{}',
        status: status || 'draft',
        publishAt: publishAt ? new Date(publishAt) : null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      {
        error: '创建报告失败',
        details: errorMessage,
        hint: '请确保数据库已设置。运行：npm run db:push 或 node scripts/init-db.js'
      },
      { status: 500 }
    );
  }
}
