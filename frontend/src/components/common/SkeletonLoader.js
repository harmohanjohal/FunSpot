import React from 'react';

// Reusable Skeleton components using Tailwind CSS animate-pulse
export const SkeletonCard = () => (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-5 flex flex-col flex-grow space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
        </div>
    </div>
);

export const SkeletonRow = ({ columns = 4 }) => (
    <tr className="animate-pulse border-b border-gray-100">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
        ))}
    </tr>
);

export const SkeletonStatBox = () => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center animate-pulse">
        <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-3"></div>
        <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
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
