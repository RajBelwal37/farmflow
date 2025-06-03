import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Format the birthDate to ISO string if it exists
    const formattedData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : null,
      userId: session.user.id,
    }

    const livestock = await prisma.livestock.create({
      data: formattedData,
    })

    return NextResponse.json(livestock)
  } catch (error) {
    console.error('Error creating livestock:', error)
    return NextResponse.json(
      { error: 'Failed to create livestock' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const livestock = await prisma.livestock.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(livestock)
  } catch (error) {
    console.error('[LIVESTOCK_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const livestockId = searchParams.get('id')

    if (!livestockId) {
      return new NextResponse('Livestock ID required', { status: 400 })
    }

    const livestock = await prisma.livestock.delete({
      where: {
        id: livestockId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(livestock)
  } catch (error) {
    console.error('[LIVESTOCK_DELETE]', error)
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
      return new NextResponse('Livestock ID required', { status: 400 })
    }

    const livestock = await prisma.livestock.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...updateData,
        birthDate: updateData.birthDate ? new Date(updateData.birthDate) : null,
      },
    })

    return NextResponse.json(livestock)
  } catch (error) {
    console.error('[LIVESTOCK_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 