import { ColumnDef, Table } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/admin/DataTableColumnHeader';
import { DataTableRowActions } from '@/components/admin/DataTableRowActions';
import { format } from 'date-fns';

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  _count: {
    crops: number;
    inventory: number;
    livestock: number;
  };
};

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }: { table: Table<User> }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }: { column: any }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }: { column: any }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }: { column: any }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }: { row: any }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }: { column: any }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }: { row: any }) => {
      return format(new Date(row.getValue('createdAt')), 'PPP');
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: any }) => <DataTableRowActions row={row} />,
  },
]; 