import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !role) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    const emailExists = await prisma.user.findUnique({
      where: {
        email,
        NOT: {
          id: params.userId,
        },
      },
    });

    if (emailExists) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    const updateData: any = {
      name,
      email,
      role,
    };

    if (password) {
      updateData.password = await hash(password, 12);
    }

    const user = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    await prisma.user.delete({
      where: {
        id: params.userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[USER_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 