'use client';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useState } from 'react';
import type { Wine } from '@/types';

export const useWineTable = (data: Wine[]) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<Wine>();

  const columns = [
    columnHelper.accessor('img', {
      cell: info => (
        <img
          src={`https:${info.getValue()}`}
          alt="Vivino Image"
          width={200}
          height={400}
          className="min-w-32"
        />
      ),
      header: () => <span></span>,
    }),
    columnHelper.accessor('title', {
      cell: info => info.getValue(),
      invertSorting: true,
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Title
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor('country', {
      cell: info => info.getValue(),
      invertSorting: true,
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Country
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor('year', {
      cell: info => info.getValue(),
      sortUndefined: 'last',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Year
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor(row => `${row.shelf + 1}:${row.column + 1}`, {
      id: 'column',
      cell: info => info.getValue(),
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Storage
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor('price', {
      cell: info => info.getValue(),
      sortUndefined: 'last',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Price
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor('rating', {
      cell: info => info.getValue(),
      sortUndefined: 'last',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Rating
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
  ];

  return useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
};