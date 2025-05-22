import { useState, useMemo, useEffect } from 'react';
import { useAnomalyStore } from '@/store/anomalyStore';
import '../styles/AnomalieGroupedByDoc.scss';
import DropdownSelect from './DropdownSelect';

interface Props {
    type: 'conflict' | 'duplicate';
}

export const AnomalieGroupedByDoc = ({ type }: Props) => {
    const [filterByDocument, setFilterByDocument] = useState('');
    const [showSearchList, setShowSearchList] = useState(false);
    const {
        sdk,
        conflictInformationList,
        duplicatedInformationList,
        setConflictState,
        setDuplicateState
    } = useAnomalyStore();

    const anomalies = type === 'conflict' ? conflictInformationList : duplicatedInformationList;

    const getAvailableStateList = (anomaly: any) => {
        if (!anomaly) return [];
        switch (anomaly.state) {
            case 'MANAGED':
                return ["DETECTED", "IGNORED"];
            case 'DETECTED':
                return ["MANAGED", "IGNORED"];
            case 'IGNORED':
                return ["DETECTED", "MANAGED"];
            case 'REDETECTED':
                return ["MANAGED", "IGNORED"];
            default:
                return [];
        }
    };

    const filteredDocumentsName = useMemo(() => {
        const allDocsRefs = anomalies.flatMap((anomaly) => anomaly.docsRef);
        const filteredDocsRefs = allDocsRefs.filter((docRef) =>
            docRef.name.toLowerCase().includes(filterByDocument.toLowerCase())
        );
        return [...new Set(filteredDocsRefs.map((docRef) => docRef.name))];
    }, [anomalies, filterByDocument]);

    const groupedDocuments = useMemo(() => {
        const grouped = anomalies.reduce((acc: any, anomaly: any) => {
            const docRefPair = [anomaly.docsRef[0].id, anomaly.docsRef[1].id].sort().join('-');
            if (!acc[docRefPair]) {
                acc[docRefPair] = [];
            }
            anomaly.docsRef.sort((a: any, b: any) => a.id.localeCompare(b.id));
            anomaly.documents.sort((a: any, b: any) => a.docId.localeCompare(b.docId));
            acc[docRefPair].push(anomaly);
            return acc;
        }, {});

        if (filterByDocument) {
            return Object.fromEntries(
                Object.entries(grouped).filter(([_, anomalies]: any) => {
                    return anomalies.some((anomaly: any) =>
                        anomaly.docsRef.some((docRef: any) =>
                            docRef.name.includes(filterByDocument)
                        )
                    );
                })
            );
        }
        return grouped;
    }, [anomalies, filterByDocument]);

    const downloadAllDocs = async (documentList: any) => {
        for (const el of documentList.docsRef) {
            try {
                console.log(el)
                await goTo(el);
            } catch (error) {
                console.error('Error downloading file:', el.name, error);
            }
        }
    };

    const goTo = async (file: any) => {
        if (file.url.indexOf('/api/orchestrator/files/download') !== -1) {
            if (!sdk) return;
            const result = await sdk.fileInstance().downloadFile(file.name);

            if (result && result.data) {
                const buffer = Buffer.from(result);
                const blob = new Blob([buffer]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = file.name;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } else {
            window.open(file.url, '_blank');
        }
    };

    const handleStatusChange = async (anomalyId: string, newState: string) => {
        if (!sdk) return;
        try {
            if (type === 'conflict') {
                await setConflictState(anomalyId, newState.toLowerCase());
            } else if (type === 'duplicate') {
                await setDuplicateState(anomalyId, newState.toLowerCase());
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="anomalie-grouped-by-doc">
            <div className="filter-group">
                <input
                    className="simple-input-h30"
                    placeholder="Filter by document name"
                    value={filterByDocument}
                    onChange={(e) => setFilterByDocument(e.target.value)}
                    onFocus={() => setShowSearchList(true)}
                />
                {filterByDocument && showSearchList && (
                    <div className="search-item-list">
                        {filteredDocumentsName.map((document) => (
                            <p
                                key={document}
                                className="text-regular-14 text-white"
                                onClick={() => {
                                    setFilterByDocument(document);
                                    setShowSearchList(false);
                                }}
                            >
                                {document}
                            </p>
                        ))}
                    </div>
                )}
            </div>
            {Object.values(groupedDocuments).map((documentList: any, index) => (
                <div key={index} className="doc-box">
                    <p className="text-bold-16 text-white open-doc" onClick={() => downloadAllDocs(documentList[0])}>
                        Two related documents #{index + 1}
                    </p>
                    <p className="text-regular-14 text-white open-doc" onClick={() => goTo(documentList[0].docsRef[0])}>
                        {documentList[0].docsRef[0].name}
                    </p>
                    <p className="text-regular-14 text-white open-doc" onClick={() => goTo(documentList[0].docsRef[1])}>
                        {documentList[0].docsRef[1].name}
                    </p>
                    <div className="anomalies-table">
                        <table>
                            <thead>
                                <tr>
                                    <th className="text-bold-14 text-white">Subject</th>
                                    <th className="text-bold-14 text-white">Status</th>
                                    <th>
                                        <p className="text-bold-14 text-white">Information Involved for</p>
                                        <p className="text-bold-14 text-white">{documentList[0].docsRef[0].name}</p>
                                    </th>
                                    <th>
                                        <p className="text-bold-14 text-white">Information Involved for</p>
                                        <p className="text-bold-14 text-white">{documentList[0].docsRef[1].name}</p>
                                    </th>
                                    <th className="text-bold-14 text-white">Explanation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentList.map((anomaly: any) => (
                                    <tr key={anomaly.id}>
                                        <td className="text-regular-14 text-white subject">{anomaly.subject}</td>
                                        <td className="state">
                                            {anomaly.state === 'DISAPPEARED' ? (
                                                <p className="text-white text-medium-14">{anomaly.state}</p>
                                            ) : (
                                                <DropdownSelect
                                                    selected={anomaly.state}
                                                    options={getAvailableStateList(anomaly)}
                                                    onChange={(newState) => handleStatusChange(anomaly.id, newState)}
                                                />
                                            )}
                                        </td>
                                        <td className="text-regular-14 text-white info">
                                            {anomaly.documents[0].information_involved}
                                        </td>
                                        <td className="text-regular-14 text-white info">
                                            {anomaly.documents[1].information_involved}
                                        </td>
                                        <td className="text-regular-14 text-white">{anomaly.explanation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnomalieGroupedByDoc;
