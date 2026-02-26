import React, { useState, lazy, Suspense } from "react";
import { useSpacing } from "./SpacingContext";

// Lazy load the entire 3D scene when needed
const Lazy3DScene = lazy(() => import("./BoxModel3DScene"));

// Main BoxModel3D component
const BoxModel3D: React.FC = () => {
  const spacing = useSpacing();
  const [autoRotate, setAutoRotate] = useState(true);
  const [show3D, setShow3D] = useState(false);

  // Toggle auto-rotation
  const toggleAutoRotate = () => setAutoRotate(!autoRotate);

  // Enable 3D view
  const enable3D = () => setShow3D(true);

  if (!show3D) {
    return (
      <div className="relative h-[400px] rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">
              3D Box Model Visualization
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
              View your box model in interactive 3D. Click to load the Three.js
              renderer.
            </p>
            <button
              onClick={enable3D}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Load 3D View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <button
        className="absolute top-2 right-2 z-10 bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm text-xs"
        onClick={toggleAutoRotate}
      >
        {autoRotate ? "Stop Rotation" : "Auto Rotate"}
      </button>
      <Suspense
        fallback={
          <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Loading 3D view...
              </div>
            </div>
          </div>
        }
      >
        <Lazy3DScene spacing={spacing} autoRotate={autoRotate} />
      </Suspense>
    </div>
  );
};

export default BoxModel3D;
