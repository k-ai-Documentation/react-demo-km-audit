import { useState, useEffect, useCallback } from 'react';
import { useAnomalyStore } from '@/store/anomalyStore';
import Image from 'next/image';
import share from 'kai-asset/share.svg';
import { Anomaly, Document } from '@/types';
import DocumentCardStyles from './../styles/DocumentCard.module.scss';
import DropdownSelect from './DropdownSelect';
import { Buffer } from 'buffer';

interface DocumentCardProps {
    document: Anomaly;
    type: 'conflict' | 'duplicate';
}

export default function DocumentCard({ document, type }: DocumentCardProps) {
    const [informationMerge, setInformationMerge] = useState<any[]>([]);
    const { sdk, setConflictState, setDuplicateState } = useAnomalyStore();
    const stateList = ['DETECTED', 'MANAGED', 'IGNORED', 'REDETECTED', 'DISAPPEARED'];

    const availableStates = (type: string)=> {
        if (type === 'DETECTED') {
            return ['MANAGED', 'IGNORE']
        }
        else if (type === 'MANAGED') {
            return ['DETECTED', 'IGNORE']
        }
        else if (type === 'IGNORE') {
            return ['DETECTED', 'MANAGED']
        }
        else if (type === 'REDETECTED') {
            return ['MANAGED', 'IGNORE']
        }
        return []
    }

    const fetchMergeInformation = useCallback(async () => {
        const { docsRef, documents } = document;
        const toReturn: any[] = [];

        if (docsRef && documents) {
            docsRef.forEach((docRef: any) => {
                documents.forEach((doc: any) => {
                    if (docRef.id === doc.docId) {
                        toReturn.push({ ...docRef, information_involved: doc.information_involved });
                    }
                });
            });
        } else if (documents) {
            const coreInstance = sdk?.core();
            for (const doc of documents) {
                try {
                    const docInfo = await coreInstance?.getDocSignature(doc.docId);
                    toReturn.push({
                        name: docInfo?.name ? docInfo.name : doc.docId,
                        url: docInfo?.url ? docInfo.url : '',
                        information_involved: doc.information_involved,
                    });
                } catch (error) {
                    console.error('Error fetching doc signature:', error);
                }
            }
        }
        setInformationMerge(toReturn);
    }, [document, sdk]);

    useEffect(() => {
        fetchMergeInformation();
    }, [fetchMergeInformation]);

    const handleStatusChange = async (newState: string) => {
        if (!sdk) return;
        console.log(newState)
        try {
            if (type === 'conflict') {
                await setConflictState(document.id, newState.toLowerCase());
            } else if (type === 'duplicate') {
                await setDuplicateState(document.id, newState.toLowerCase());
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const goTo = async (file: any) => {
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
                    const a = window.document.createElement('a');
                    window.document.body.appendChild(a);
                    a.style.display = 'none';
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    window.document.body.removeChild(a);
                }
            } catch (error) {
                console.error('Error downloading file:', error);
            }
        } else if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    const downloadAll = async () => {
        informationMerge.forEach(async (info) => {
            await goTo(info)
        })
    }

    return (
        <div className={DocumentCardStyles['document-card']}>
            <div className={DocumentCardStyles['top']}>
                <p className="text-white text-medium-16">Subject: {document.subject}</p>
                <div className={DocumentCardStyles['toggle-block']}>
                    {document.state == 'DISAPPEARED' ? (
                        <p className="text-white text-medium-16">{document.state}</p>
                    ) : (
                        <DropdownSelect selected={document.state} onChange={handleStatusChange} options={availableStates(document.state)} />
                    )}
                </div>
            </div>
            {informationMerge.map((info, index) => (
                <div className={DocumentCardStyles['information']} key={index}>
                    <p className="text-white text-bold-14 name" onClick={() => goTo(info)}>
                        DOC {index + 1}
                    </p>
                    <p className="text-white text-regular-14 detail">{info.information_involved}</p>
                </div>
            ))}
            {document.explanation && (
                <div className={DocumentCardStyles['explanation']}>
                    <p className="text-white text-bold-14">Explanation</p>
                    <p className="text-white text-regular-14">{document.explanation}</p>
                </div>
            )}
            <div className={DocumentCardStyles['open-all']}> 
                <div className={DocumentCardStyles['action']} onClick={() => downloadAll()}>
                    <p className='text-white text-regular-14'>Open all these documents</p>
                    <Image src={share} width={20} height={20} alt="share" />
                </div>
            </div>


            <style jsx>{`
                .name {
                    cursor: pointer;

                    &:hover {
                        color: var(--primary-color);
                    }
                }
                .detail {
                    line-height: 1.3;
                    white-space: pre-wrap;
                }
            `}</style>
        </div>
    );
}
