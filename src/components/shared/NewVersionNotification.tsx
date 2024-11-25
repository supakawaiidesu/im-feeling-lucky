import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const NewVersionNotification = () => {
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    const checkForNewVersion = async () => {
      try {
        const currentBuildId = (document.querySelector('meta[name="build-id"]') as HTMLMetaElement)?.content;
        
        const response = await fetch('/api/build-id');
        const { buildId: latestBuildId } = await response.json();

        if (currentBuildId && latestBuildId && currentBuildId !== latestBuildId) {
          setShowUpdateAlert(true);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    checkForNewVersion();
    const interval = setInterval(checkForNewVersion, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showUpdateAlert) return null;

  return (
    <div className="fixed z-50 max-w-sm bottom-4 right-4">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-gray-700">
        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">New Version Available</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2 text-blue-600 dark:text-blue-300">A new version of the app is available.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Refresh Now
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NewVersionNotification;