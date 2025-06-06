import { NextResponse } from 'next/server';
import { TaskService } from '@/lib/task-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const taskData = await request.json();
    const taskService = new TaskService();
    const task = await taskService.createTask({ ...taskData, userId: session.user.id });
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse('Failed to create task', { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const taskService = new TaskService();
    const tasks = await taskService.getTasks(session.user.id);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Failed to fetch tasks', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const id = request.url.split('/').pop(); // Assuming id is the last part of the URL

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!id) {
    return new NextResponse('Task ID is required', { status: 400 });
  }

  try {
    const { status } = await request.json(); // Assuming only status is updated for now
    const taskService = new TaskService();
    // TODO: Add logic to verify the task belongs to the user before updating
    const updatedTask = await taskService.updateTaskStatus(id, status);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return new NextResponse('Failed to update task status', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const id = request.url.split('/').pop(); // Assuming id is the last part of the URL

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!id) {
    return new NextResponse('Task ID is required', { status: 400 });
  }

  try {
    const taskService = new TaskService();
    // TODO: Add logic to verify the task belongs to the user before deleting
    await taskService.deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Failed to delete task', { status: 500 });
  }
} 