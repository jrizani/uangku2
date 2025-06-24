import React from 'react';
import { LightbulbIcon, ThumbsDownIcon, ThumbsUpIcon, TrendingUpIcon } from '../../utils/icons';

const CardSection = ({ title, icon, children, colorClass }) => (
    <div className="flex items-start space-x-3">
        <div className={`mt-1 p-1.5 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-gray-700">{title}</h4>
            {children}
        </div>
    </div>
);

export function AnalysisCard({ analysis, isLoading, error }) {
    if (isLoading) {
        return (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded-r-lg animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-blue-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-blue-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mt-6 rounded-r-lg">{error}</div>;
    }

    if (!analysis) return null;

    return (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-5 mt-6 rounded-r-lg space-y-5 transition-all duration-500 ease-in-out">
            <CardSection title="Ringkasan" icon={<TrendingUpIcon />} colorClass="bg-gray-200">
                <p className="text-sm text-gray-600">{analysis.summary}</p>
            </CardSection>

            <CardSection title="Hal Positif" icon={<ThumbsUpIcon />} colorClass="bg-green-100 text-green-600">
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {analysis.good_points.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </CardSection>

            <CardSection title="Perlu Ditingkatkan" icon={<ThumbsDownIcon />} colorClass="bg-red-100 text-red-600">
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {analysis.points_to_improve.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </CardSection>

            <CardSection title="Saran Praktis" icon={<LightbulbIcon />} colorClass="bg-yellow-100 text-yellow-600">
                <p className="text-sm text-gray-600">{analysis.suggestion}</p>
            </CardSection>
        </div>
    );
}