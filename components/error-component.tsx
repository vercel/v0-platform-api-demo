import React from "react";

type ErrorComponentProps = {
};

export const ErrorComponent: React.FC<ErrorComponentProps> = () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-50">
      <div className="flex flex-col items-center space-y-2 text-center max-w-md">
        <div className="text-red-500 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900">Preview Error</h3>
        <p className="text-sm text-gray-600">
          Unable to load the preview. The content may be loading or there might be a connection issue.
        </p>
      </div>
    </div>
);