'use client';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Wine } from '@/types';

export const useWineTable = (data: Wine[]) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<Wine>();

  const sortPrice = (a: Row<Wine>, b: Row<Wine>) =>
    Number(a.original.price) - Number(b.original.price);

  const columns = [
    columnHelper.accessor('img', {
      cell: info => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https:${info.getValue()}`}
          alt="Vivino Image"
          width={200}
          height={400}
          className="max-w-32 md:max-w-48"
        />
      ),
      header: () => <span></span>,
    }),
    columnHelper.accessor('title', {
      cell: info => <p className="w-32">{info.getValue()}</p>,
      invertSorting: true,
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Title
          <ArrowUpDown className="ml-2 h-4" />
        </Button>
      ),
    }),
    columnHelper.accessor('country', {
      cell: info => <p className="w-32">{info.getValue()}</p>,
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
      sortingFn: sortPrice,
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
