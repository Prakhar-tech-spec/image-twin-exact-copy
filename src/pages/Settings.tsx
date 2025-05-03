import React from "react";

const Settings = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="bg-gray-50 rounded-2xl shadow p-8 w-full max-w-xl text-center">
        <p className="text-gray-500 text-lg mb-2">Settings options will appear here.</p>
        <p className="text-gray-400 text-sm">You can add user preferences, theme, account, and other configuration options.</p>
      </div>
    </div>
  );
};

export default Settings; 