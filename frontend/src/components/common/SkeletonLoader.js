import React from 'react';

// Reusable Skeleton components - Dark Theme
export const SkeletonCard = () => (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-700/30 animate-pulse" style={{ background: 'var(--glass-bg)' }}>
        <div className="w-full h-48 bg-slate-700/50"></div>
        <div className="p-5 flex flex-col flex-grow space-y-4">
            <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
            <div className="space-y-2 mt-4">
                <div className="h-4 bg-slate-700/40 rounded w-full"></div>
                <div className="h-4 bg-slate-700/40 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700/40 rounded w-1/2"></div>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
                <div className="h-8 bg-slate-700/40 rounded flex-1"></div>
                <div className="h-8 bg-slate-700/40 rounded flex-1"></div>
            </div>
        </div>
    </div>
);

export const SkeletonRow = ({ columns = 4 }) => (
    <tr className="animate-pulse border-b border-slate-700/30">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-slate-700/40 rounded w-3/4"></div>
            </td>
        ))}
    </tr>
);

export const SkeletonStatBox = () => (
    <div className="rounded-xl p-6 text-center animate-pulse border border-slate-700/30" style={{ background: 'var(--bg-input)' }}>
        <div className="h-10 w-16 bg-slate-700/40 rounded mx-auto mb-3"></div>
        <div className="h-4 w-24 bg-slate-700/40 rounded mx-auto"></div>
    </div>
);

export const SkeletonGrid = ({ count = 4, type = 'card' }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};
