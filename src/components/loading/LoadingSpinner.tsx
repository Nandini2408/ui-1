
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-border-dark border-t-tech-green",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-text-secondary animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
