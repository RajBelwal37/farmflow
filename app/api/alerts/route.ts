import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alerts = await prisma.weatherAlert.findMany({
      where: { isActive: true, endTime: { gt: new Date() } },
      orderBy: { startTime: 'desc' },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, severity, message, startTime, endTime } = await req.json();
    const alert = await prisma.weatherAlert.create({
      data: {
        type,
        severity,
        message,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
      },
    });
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.weatherAlert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
} 