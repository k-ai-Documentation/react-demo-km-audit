import { useState } from 'react';
import { Buffer } from 'buffer';
import { useAnomalyStore } from '@/store/anomalyStore';
import DocumentCard from '@/app/components/DocumentCard';
import ModalTemplate from '@/app/components/ModalTemplate';
import { Document, Anomaly } from '@/types';
import Image from 'next/image';
import share from 'kai-asset/share.svg';
import ModalStyles from './../styles/ModalTemplate.module.scss'
import DocumentListStyles from './../styles/DocumentList.module.scss'

interface AnomaliesByType {
    [key: string]: Anomaly[];
}

type OrderField = 'name' | 'count_conflicts' | 'count_duplicates';
type AnomalyType = 'conflict' | 'duplicate';

export default function DocumentList() {
    const [orderType, setOrderType] = useState<OrderField>('count_conflicts');
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
    const [showModal, setShowModal] = useState(false);
    const [modalFileId, setModalFileId] = useState('');
    const [anomalies, setAnomalies] = useState<AnomaliesByType>({});
    const { documentsToManageList, sdk } = useAnomalyStore();

    const orderBy = (type: OrderField) => {
        const newOrderDirection = orderType !== type ? 'desc' : orderDirection === 'asc' ? 'desc' : 'asc';
        setOrderType(type);
        setOrderDirection(newOrderDirection);

        // Sort the documents list
        documentsToManageList.sort((a: Document, b: Document) => {
            const aValue = type === 'name' ? a[type] || '' : a[type] || 0;
            const bValue = type === 'name' ? b[type] || '' : b[type] || 0;
            if (type === 'name') {
                return newOrderDirection === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
            }
            return newOrderDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
        });
    };

    const showFileAnomalies = async (file: Document) => {
        if (!sdk || !file.id) return;
        try {
            const result = await sdk.auditInstance().getAnomaliesForDoc(file.id);
            setAnomalies(result);
            setModalFileId(file.id);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching file anomalies:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setAnomalies({});
        setModalFileId('');
    };

    const goTo = async (file: Document) => {
        if (!file.name) return;

        if (file.url?.includes('/api/orchestrator/files/download')) {
            if (!sdk) return;

            try {
                const result = await sdk.fileInstance().downloadFile(file.name);
                if (result) {
                    let fileContent: string;
                    if (Array.isArray(result)) {
                        fileContent = result.join('');
                    } else if (typeof result === 'string') {
                        fileContent = result;
                    } else {
                        fileContent = String(result);
                    }

                    const buffer = Buffer.from(fileContent);
                    const blob = new Blob([buffer]);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style.display = 'none';
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            } catch (error) {
                console.error('Error downloading file:', error);
            }
        } else if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    const getAnomalyType = (type: string): AnomalyType => {
        const lowercaseType = type.toLowerCase();
        return lowercaseType === 'conflict' || lowercaseType === 'duplicate' ? (lowercaseType as AnomalyType) : 'conflict';
    };

    return (
        <div className={DocumentListStyles['document-list']}>
            <table className={DocumentListStyles['table']}>
                <thead>
                    <tr>
                        <th className={DocumentListStyles['th']}>
                            <p className='text-white text-medium-14' onClick={() => orderBy('name')}>
                                Name
                                {orderType === 'name' && <span>{orderDirection === 'asc' ? ' ▲' : ' ▼'}</span>}
                            </p>
                        </th>
                        <th>
                            <p className='text-white text-medium-14'  onClick={() => orderBy('count_conflicts')}>
                                Conflicts
                                {orderType === 'count_conflicts' && <span>{orderDirection === 'asc' ? ' ▲' : ' ▼'}</span>}
                            </p>
                        </th>
                        <th>
                            <p className='text-white text-medium-14'  onClick={() => orderBy('count_duplicates')}>
                                Duplicates
                                {orderType === 'count_duplicates' && <span>{orderDirection === 'asc' ? ' ▲' : ' ▼'}</span>}
                            </p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {documentsToManageList.map((doc: Document, index: number) => (
                        <tr key={index}>
                            <td className="document-title">
                                <p className="text-white text-regular-14" onClick={() => showFileAnomalies(doc)}>
                                    {doc.name}
                                </p>
                            </td>
                            <td className="text-white text-regular-14">{doc.count_conflicts}</td>
                            <td className="text-white text-regular-14">{doc.count_duplicates}</td>
                            <td >
                                <Image src={share} alt="Share" width={24} height={24} onClick={() => goTo(doc)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <div className={ModalStyles['modal-container']}>
                    <div className={ModalStyles['modal-bg']} onClick={closeModal}>
                    </div>

                    <ModalTemplate isOpen={showModal} onClose={closeModal} title={`Anomalies for document ${modalFileId}`}>
                        {Object.entries(anomalies).map(([type, items]: [string, Anomaly[]], index) => (
                            <div key={index}>
                                <p className="text-white text-medium-16 mb-3">{type}</p>
                                {items.map((item: Anomaly, itemIndex: number) => (
                                    <DocumentCard key={itemIndex} document={item} type={getAnomalyType(type)} />
                                ))}
                            </div>
                        ))}
                    </ModalTemplate>
                </div>
            )}
        </div>
    );
}
