import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidationError, getYAMLLines } from './yamlUtils';

interface YAMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: ValidationError[];
  height?: string;
}

export const YAMLEditor = ({
  value,
  onChange,
  errors,
  height = '300px',
}: YAMLEditorProps) => {
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    const errorLines = new Set(errors.map((err) => err.line));
    setHighlightedLines(errorLines);
  }, [errors]);

  const lines = getYAMLLines(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="yaml-input">YAML Input</Label>
      <div className="relative border rounded-lg overflow-hidden bg-background">
        {/* Line numbers and content */}
        <div className="flex">
          {/* Line numbers */}
          <div className="bg-muted text-muted-foreground select-none font-mono text-sm border-r flex flex-col">
            {lines.map(({ line }) => (
              <div
                key={line}
                className={`px-4 py-1 text-right min-w-[50px] h-[1.5em] flex items-center justify-end ${
                  highlightedLines.has(line)
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400 font-semibold'
                    : ''
                }`}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Textarea
              id="yaml-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0"
              style={{
                height,
                minHeight: '200px',
                lineHeight: '1.5em',
                padding: '8px 16px',
              }}
              spellCheck="false"
              placeholder="Paste your YAML content here..."
            />
          </div>
        </div>

        {/* Error indicators */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900/50 p-4">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">
                      Line {error.line}, Column {error.column}:
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300 break-words">
                      {error.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {value && errors.length === 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            YAML is valid
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
