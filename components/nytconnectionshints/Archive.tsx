import React from 'react';
import Link from 'next/link';

interface ArchivePageProps {
    years: {
        year: number;
        months: {
            month: number;
            days: { day: number, url: string }[];
        }[];
    }[];
}

const ArchivePage: React.FC<ArchivePageProps> = ({ years }) => {
    const getMonthName = (month: number) => {
        return new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' });
    };

    const getDateString = (year: number, month: number, day: number) => {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
                    NYT Connections Archive
                </h1>

                {/* Introduction Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <p className="text-gray-600 leading-relaxed">
                        Welcome to our comprehensive archive of NYT Connections game hints. Here you can find hints
                        for all previous puzzles. For today's puzzle hints and answers, please visit our{' '}
                        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                            homepage
                        </Link>
                        . This archive is updated daily as soon as the new puzzle is released.
                    </p>
                </div>

                {/* Archive Section */}
                <div className="space-y-12">
                    {years.map((yearData) => (
                        <div key={yearData.year} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {yearData.year}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {yearData.months.map(({ month, days }) => (
                                    <div
                                        key={`${yearData.year}-${month}`}
                                        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <h3 className="text-lg font-medium text-gray-700 mb-4">
                                            {getMonthName(month)}
                                        </h3>
                                        <div className="grid grid-cols-7 gap-1">
                                            {/* Week day headers */}
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                <div
                                                    key={day}
                                                    className="text-xs text-gray-500 font-medium text-center p-1"
                                                >
                                                    {day}
                                                </div>
                                            ))}

                                            {/* Empty spaces before first day */}
                                            {[...Array(new Date(yearData.year, month - 1, 1).getDay())].map((_, i) => (
                                                <div key={`empty-${i}`} className="aspect-square" />
                                            ))}

                                            {/* Days */}
                                            {[...Array(31)].map((_, i) => {
                                                const day = i + 1;
                                                const dayExists = days.find((d) => d.day === day);

                                                if (day > new Date(yearData.year, month, 0).getDate()) {
                                                    return null;
                                                }

                                                return dayExists ? (
                                                    <Link
                                                        key={day}
                                                        href={dayExists.url}
                                                        className="aspect-square flex items-center justify-center text-sm 
                                     bg-blue-50 hover:bg-blue-100 text-blue-700 rounded 
                                     transition-colors duration-200"
                                                    >
                                                        {day}
                                                    </Link>
                                                ) : (
                                                    <div
                                                        key={day}
                                                        className="aspect-square flex items-center justify-center text-sm 
                                     text-gray-400 bg-gray-50"
                                                    >
                                                        {day}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;