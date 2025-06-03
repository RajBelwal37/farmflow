import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST /api/crops');
    const session = await getServerSession(authOptions)
    console.log('Session data:', session);

    if (!session?.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json(
        { error: 'Unauthorized - No user ID found' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Received crop data:', data);

    // Remove any fields that don't exist in the database schema
    const { progress, ...validData } = data;

    // Format dates to ISO string
    const formattedData = {
      ...validData,
      plantingDate: new Date(data.plantingDate).toISOString(),
      expectedHarvest: new Date(data.expectedHarvest).toISOString(),
      userId: session.user.id,
    }
    console.log('Formatted crop data:', formattedData);

    // Verify user exists before creating crop
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const crop = await prisma.crop.create({
      data: formattedData,
    })
    console.log('Created crop:', crop);

    return NextResponse.json(crop)
  } catch (error) {
    console.error('Error creating crop:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid user ID. Please try logging in again.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create crop' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const crops = await prisma.crop.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(crops)
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crops' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cropId = searchParams.get('id')

    if (!cropId) {
      return new NextResponse('Crop ID required', { status: 400 })
    }

    const crop = await prisma.crop.delete({
      where: {
        id: cropId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(crop)
  } catch (error) {
    console.error('[CROP_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return new NextResponse('Crop ID required', { status: 400 })
    }

    // Format dates for update
    const formattedData = {
      ...updateData,
      plantingDate: new Date(updateData.plantingDate).toISOString(),
      expectedHarvest: new Date(updateData.expectedHarvest).toISOString(),
    }

    const crop = await prisma.crop.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: formattedData,
    })

    return NextResponse.json(crop)
  } catch (error) {
    console.error('[CROP_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 