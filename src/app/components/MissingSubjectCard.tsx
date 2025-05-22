'use client';

interface Subject {
  subject: string;
  explanation: string;
}

interface MissingSubjectCardProps {
  subject: Subject;
}

export default function MissingSubjectCard({ subject }: MissingSubjectCardProps) {
  return (
    <div className="missing-subject-card">
      <div className="card-content">
        <p className="text-white text-medium-16">Subject: {subject.subject}</p>
        <p className="text-grey text-regular-14">{subject.explanation}</p>
      </div>

      <style jsx>{`
        .missing-subject-card {
          background-color: var(--color-background-soft);
          border-radius: 5px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .missing-subject-card:last-child {
          margin-bottom: 0;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .text-medium-16 {
          font-size: 16px;
          font-weight: 500;
        }

        .text-regular-14 {
          font-size: 14px;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}