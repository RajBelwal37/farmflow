import { UserForm } from '../_components/UserForm';

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-muted-foreground">
          Add a new user to the system.
        </p>
      </div>
      <UserForm />
    </div>
  );
} 