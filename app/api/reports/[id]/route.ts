import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: '未找到报告' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: '获取报告失败' }, { status: 500 });
  }
}

// PUT update report
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, basicSummary, fullContent, status, publishAt } = body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(basicSummary !== undefined && { basicSummary }),
        ...(fullContent !== undefined && { fullContent }),
        ...(status !== undefined && { status }),
        ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: '更新报告失败' }, { status: 500 });
  }
}
