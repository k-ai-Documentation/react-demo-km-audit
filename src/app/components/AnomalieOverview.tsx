import DocumentCard from '@/app/components/DocumentCard';
import ModalTemplate from '@/app/components/ModalTemplate';
import { useAnomalyStore } from "@/store/anomalyStore";
import { useState, useMemo } from 'react';
import AnomalieStyles from "./../styles/AnomalieOverview.module.scss";
import ModalStyles from './../styles/ModalTemplate.module.scss'

interface Document {
    docsRef: any[];
    documents: any[];
    explanation: string;
    id: string;
    state: string;
    subject: string;
}

interface SujetOccurrence {
    subject: string;
    occurrences: number;
}
interface RelatedDocumentsProps {
    type: 'conflict' | 'duplicate';
}
export default function AnomalieOverview({type}: RelatedDocumentsProps ) {
    const { conflictInformationList, duplicatedInformationList } = useAnomalyStore();
    const anomalies = type === 'conflict' ? conflictInformationList : duplicatedInformationList;

    const [showModal, setShowModal] = useState(false);
    const [filteredAnomalies, setFilteredAnomalies] = useState<Document[]>([]);

    const top10BySubject = useMemo(() => {
        const subjectOccurrences: { [key: string]: number } = {};
        
        anomalies.forEach((doc) => {
            if (subjectOccurrences[doc.subject]) {
                subjectOccurrences[doc.subject]++;
            } else {
                subjectOccurrences[doc.subject] = 1;
            }
        });
        
        return Object.entries(subjectOccurrences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([subject, occurrences]) => ({ subject, occurrences }));
    }, [anomalies]);

    const getFilteredAnomalies = (subject: string) => {
        const filtered = anomalies.filter((doc) => doc.subject === subject);
        setFilteredAnomalies(filtered);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    return (
        <div className={AnomalieStyles['anomalies']}>
            <table className={AnomalieStyles['table']}>
                <thead>
                    <tr>
                        <th>
                            <p className="text-medium-14 text-grey">Ranking</p>
                        </th>
                        <th>
                            <p className="text-medium-14 text-grey">Subject</p>
                        </th>
                        <th>
                            <p className="text-medium-14 text-grey">Occurrences</p>
                        </th>
                    </tr>
                </thead>
                <tbody className={AnomalieStyles['tbody']}>
                    {top10BySubject.map((item, index) => (
                        <tr key={index} className={AnomalieStyles.tr}>
                            <td className={AnomalieStyles.td}>
                                <p className="text-regular-14 text-white">{index + 1}</p>
                            </td>
                            <td className={AnomalieStyles.td}>
                                <p className={`text-regular-14 text-white ${AnomalieStyles['subject']}`} onClick={() => { getFilteredAnomalies(item.subject); setShowModal(true); }}>{item.subject}</p>
                            </td>
                            <td className={AnomalieStyles.td}>
                                <p className="text-medium-14 text-white">{item.occurrences}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
            <div className={ModalStyles['modal-container']}>
                <div 
                    className={ModalStyles['modal-bg']} 
                    onClick={closeModal}
                />
                <ModalTemplate 
                    isOpen={showModal}
                    onClose={closeModal}
                    title={`${type.charAt(0).toUpperCase() + type.slice(1)} documents`}
                >
                    {filteredAnomalies && filteredAnomalies.length > 0 && (
                        <div>
                            {filteredAnomalies.map(document => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    type={type}
                                />
                            ))}
                        </div>
                    )}
                </ModalTemplate>
            </div>
        )}

            
        </div>

        
    )
}