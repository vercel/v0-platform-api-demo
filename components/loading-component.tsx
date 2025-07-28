import React from "react";

type LoadingComponentProps = {
    message?: string;
    color?: string; // Accepts any valid CSS color value
};

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
    message = "Loading preview",
    color = "#3B82F6", // Default to Tailwind's blue-500
}) => (
    <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <div className="flex flex-col items-center space-y-2">
            <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: color, borderBottomColor: color }}
            ></div>
            <p className="text-sm text-gray-600">{message}...</p>
        </div>
    </div>
);