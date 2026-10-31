'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Guitar } from '@/types';
import { formatSoldDate, formatSoldPrice } from '@/utils/maintenance';

const priceText = (guitar: Guitar) => guitar.soldPrice != null ? formatSoldPrice(guitar.soldPrice) : '—';

export function ArchivedGuitarList({ guitars }: { guitars: Guitar[] }) {
  if (!guitars.length) return (
    <div className="panel text-center py-10 max-w-lg mx-auto">
      <h2 className="font-semibold mb-2">No sold guitars yet</h2>
      <p className="text-sm text-[#5c6680]">Open a guitar and choose Move to archive when you sell it.</p>
    </div>
  );

  return (
    <>
      <div className="flex min-[1000px]:hidden flex-col gap-2">
        {guitars.map(guitar => (
          <Link key={guitar.id} href={`/guitar/${guitar.id}`} className="block rounded-[14px] border bg-white px-[18px] py-[14px] hover:bg-surface-2 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="font-semibold min-w-0 break-words">{guitar.maker} {guitar.model}</span>
              <span className="text-sm font-semibold">{priceText(guitar)}</span>
            </div>
            <p className="text-sm text-[#5c6680]">Sold {formatSoldDate(guitar.soldDate!)}{guitar.year && ` · ${guitar.year}`}</p>
          </Link>
        ))}
      </div>
      <div className="hidden min-[1000px]:block rounded-[14px] border bg-white overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_170px_140px_24px] gap-4 px-5 py-3 border-b section-label">
          <span>Guitar</span><span>Sold</span><span>Price</span><span className="sr-only">Details</span>
        </div>
        {guitars.map(guitar => (
          <Link key={guitar.id} href={`/guitar/${guitar.id}`} className="grid grid-cols-[minmax(0,1fr)_170px_140px_24px] gap-4 items-center px-5 py-4 border-b last:border-b-0 hover:bg-surface-2 transition-colors">
            <div className="min-w-0"><p className="text-sm font-semibold break-words">{guitar.maker} {guitar.model}</p>{guitar.year && <p className="text-sm text-[#5c6680] mt-1">{guitar.year}</p>}</div>
            <p className="text-sm text-[#5c6680]">{formatSoldDate(guitar.soldDate!)}</p>
            <p className="text-sm font-semibold">{priceText(guitar)}</p>
            <ChevronRight size={16} className="text-[#5c6680]" />
          </Link>
        ))}
      </div>
    </>
  );
}
