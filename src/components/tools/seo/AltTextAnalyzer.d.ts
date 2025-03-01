interface ImageData {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    fileSize: number;
    location: string;
    container: string;
    contextText?: string;
}
interface AltTextAnalysis {
    score: number;
    length: number;
    quality: "poor" | "good" | "excessive";
    issues: string[];
    suggestions: string[];
}
declare const ImageGallery: ({ images, onEdit, }: {
    images: ImageData[];
    onEdit: (id: string, newAlt: string) => void;
}) => import("react/jsx-runtime").JSX.Element;
declare const AnalysisView: ({ images, analysis, }: {
    images: ImageData[];
    analysis: Record<string, AltTextAnalysis>;
}) => import("react/jsx-runtime").JSX.Element;
declare const AnalyticsView: ({ analysis, }: {
    analysis: Record<string, AltTextAnalysis>;
}) => import("react/jsx-runtime").JSX.Element;
declare const AccessibilityDashboard: ({ images, analysis, onUpdateAlt, onUpdateImages, }: {
    images: ImageData[];
    analysis: Record<string, AltTextAnalysis>;
    onUpdateAlt: (id: string, newAlt: string) => void;
    onUpdateImages: (newImages: ImageData[]) => void;
}) => import("react/jsx-runtime").JSX.Element;
declare const AltTextAnalyzer: () => import("react/jsx-runtime").JSX.Element;
export { ImageGallery, AnalysisView, AnalyticsView, AccessibilityDashboard };
export default AltTextAnalyzer;
