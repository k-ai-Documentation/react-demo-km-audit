import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from '../styles/DocumentCard.module.scss';
import DropdownSelect from './DropdownSelect';
import { KaiStudio } from 'sdk-js';
import Image from 'next/image';
import share from 'kai-asset/share.svg'

interface DocumentCardProps {
    document: any;
    type: string;
    credentials: any;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, type, credentials }) => {
    const [informationMerge, setInformationMerge] = useState<any[]>([]);
    const [status, setStatus] = useState<string>(document.state);
    const stateList = ['DETECTED', 'MANAGED', 'IGNORED'];

    const sdk =
        credentials.organizationId && credentials.instanceId && credentials.apiKey
            ? new KaiStudio({
                  organizationId: credentials.organizationId,
                  instanceId: credentials.instanceId,
                  apiKey: credentials.apiKey,
              })
            : new KaiStudio({
                  host: credentials.host,
                  apiKey: credentials.apiKey,
              });

    const kmAudit = sdk?.auditInstance();

    useEffect(() => {
        fetchMergeInformation();
    }, []);

    const fetchMergeInformation = async () => {
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
            const searchInstance = sdk?.search();
            for (const doc of documents) {
                const docInfo = await searchInstance.getDocSignature(doc.docId);
                toReturn.push({
                    name: docInfo?.name ? docInfo.name : doc.docId,
                    url: docInfo?.url ? docInfo.url : "",
                    information_involved: doc.information_involved,
                });
            }
        }
        setInformationMerge(toReturn);
    };

    const handleStatusChange = async (newState: string) => {
        if (status === 'MANAGED' || document.state === 'MANAGED') return;
        setStatus(newState);
        switch (type) {
            case 'conflict':
                await kmAudit.conflictInformationSetState(document.id, newState.toLowerCase());
                break;
            case 'duplicate':
                await kmAudit.duplicatedInformationSetState(document.id, newState.toLowerCase());
                break;
        }
        document.state = newState;
    };

    const goTo = async (file: any) => {
        if (file.url.includes('/api/orchestrator/files/download')) {
            let baseUrl = credentials.host || `https://${credentials.organizationId}.kai-studio.ai/${credentials.instanceId}`;
            let headers = baseUrl.includes('kai-studio')
                ? {
                      'organization-id': credentials.organizationId,
                      'instance-id': credentials.instanceId,
                      'api-key': credentials.apiKey,
                  }
                : { 'Content-Type': 'application/json' };

            const result = await axios.post(`${baseUrl}${file.url}`, {}, { headers });
            if (result.data) {
                const blob = new Blob([new Uint8Array(result.data.response)]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = file.name;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } else {
            window.open(file.url, '_blank');
        }
    };

    const downloadAll = () => {
        informationMerge.forEach(async (el) => {
            await goTo(el);
        });
    };

    return (
        <div className={styles['document-card']}>
            <div className={styles['top']}>
                <p className="text-white text-medium-14">Subject: {document.subject}</p>
                <div className={styles['toggle-block']}>
                    {status === 'MANAGED' || status === 'IGNORED' ? (
                        <p className="text-white text-medium-14">{status}</p>
                    ) : (
                        <DropdownSelect selected={status} options={stateList} onChange={handleStatusChange} />
                    )}
                </div>
            </div>
            <div className={styles['information']}>
                {informationMerge.map((element, index) => (
                    <div key={index} className={styles['information']}>
                        <p className={`text-white text-bold-14 ${styles["name"]}`} onClick={() => goTo(element)}>
                            {element?.name ? element.name : ""}
                        </p>
                        <p className={`text-grey text-regular-14 ${styles["involved-information"]}`}>Involved information:</p>
                        <p className={`text-white text-regular-14 ${styles["detail"]}`}>{element.information_involved}</p>
                    </div>
                ))}
            </div>
            <div className={styles['open-all']}>
                <div className={styles['action']} onClick={downloadAll}>
                    <p className='text-regular-14 text-white'>Open all documents</p>
                    <Image src={share} alt="Open all this documents" className='icon-18' width={18} height={18} />
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;
