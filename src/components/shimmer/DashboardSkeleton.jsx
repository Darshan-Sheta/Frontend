import React from 'react';
import Navigation from '../navigation/Navigation';
import ShimmerEffect from './ShimmerEffect';

const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Persist Navigation if possible, or simulate it */}
            <Navigation />

            <div className="container mx-auto p-4 pt-24 pb-24 flex flex-col items-center">
                {/* Simulate Welcome Text */}
                <ShimmerEffect className="h-10 w-96 mb-8 rounded bg-gray-800" />

                {/* Simulate Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 h-64 border border-white/5">
                            <ShimmerEffect className="h-6 w-1/3 mb-4 rounded bg-gray-700" />
                            <ShimmerEffect className="h-32 w-full rounded mb-4 bg-gray-800" />
                            <div className="flex justify-between">
                                <ShimmerEffect className="h-4 w-1/4 rounded bg-gray-700" />
                                <ShimmerEffect className="h-4 w-1/4 rounded bg-gray-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
