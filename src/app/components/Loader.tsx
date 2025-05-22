'use client';

interface LoaderProps {
  color?: string;
  className?: string;
}

export default function Loader({ color = 'currentColor', className = '' }: LoaderProps) {
  return (
    <div className={`loader ${className}`}>
      <div className="spinner" />
      <style jsx>{`
        .loader {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid ${color};
          border-bottom-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}