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

    const inventory = await prisma.inventory.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
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

    const inventory = await prisma.inventory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
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
    const itemId = searchParams.get('id')

    if (!itemId) {
      return new NextResponse('Inventory item ID required', { status: 400 })
    }

    const inventory = await prisma.inventory.delete({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('[INVENTORY_DELETE]', error)
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
      return new NextResponse('Inventory item ID required', { status: 400 })
    }

    const inventory = await prisma.inventory.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('[INVENTORY_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 