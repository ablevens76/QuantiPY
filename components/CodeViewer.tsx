import React from 'react';

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  return (
    <div className="h-full bg-slate-900 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <i className="fab fa-python text-yellow-400"></i>
           <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Generated Python 3.14 Source</span>
        </div>
        <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">PEP 703 Enabled</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-sm text-blue-100 whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;