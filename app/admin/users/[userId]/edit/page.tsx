import { prisma } from '@/lib/prisma';
import { UserForm } from '../../_components/UserForm';
import { notFound } from 'next/navigation';

interface EditUserPageProps {
  params: {
    userId: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-muted-foreground">
          Edit user information.
        </p>
      </div>
      <UserForm initialData={user} />
    </div>
  );
} 