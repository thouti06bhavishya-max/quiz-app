import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = HelpCircle,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition hover:shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
