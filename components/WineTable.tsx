'use client';
import { useWineTable } from '@/hooks/useWineTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { flexRender } from '@tanstack/react-table';
import { useContext } from 'react';
import { WineDetailsDialogContext } from '@/providers/WineDetailsDialogProvider';
import type { Wine } from '@/types';

type WineTableProps = {
  data: Wine[];
};

export const WineTable = ({ data }: WineTableProps) => {
  const table = useWineTable(data);
  const { handleOpenWineDialog } = useContext(WineDetailsDialogContext);

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-inherit">
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="w-[100px] py-4">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              onClick={() => handleOpenWineDialog(row.original)}
              className="cursor-pointer"
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="font-medium p-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
