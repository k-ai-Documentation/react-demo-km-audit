import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/DocumentList.module.scss";
import ModalTemplate from "./ModalTemplate";
import { KaiStudio } from "sdk-js";
import DocumentCard from "./DocumentCard";
import Image from "next/image";
import downloadIcon from "kai-asset/download.svg"

interface Anomalies {
    conflicts: any[];
    duplicated: any[];
}

export function DocumentList({ credentials, documents }) {
    const [sdk, setSdk] = useState<any>(null);
    const [orderType, setOrderType] = useState("count_conflicts");
    const [orderDirection, setOrderDirection] = useState("asc");
    const [showModal, setShowModal] = useState(false);
    const [modalFileId, setModalFileId] = useState("");
    const [anomalies, setAnomalies] = useState<any>({});

    useEffect(() => {
        if (credentials.organizationId && credentials.instanceId && credentials.apiKey) {
            setSdk(
                new KaiStudio({
                    organizationId: credentials.organizationId,
                    instanceId: credentials.instanceId,
                    apiKey: credentials.apiKey,
                })
            );
        } else if (credentials.host && credentials.apiKey) {
            setSdk(
                new KaiStudio({
                    host: credentials.host,
                    apiKey: credentials.apiKey,
                })
            );
        }
        orderBy("count_conflicts");
    }, [credentials]);

    async function goTo(file: any) {
        if (file.url?.includes("/api/orchestrator/files/download")) {
            if (!sdk) return;

            const result = await sdk.fileInstance().downloadFile(file.name);

            if (result && result.data) {
                const buffer = Buffer.from(result);
                const blob = new Blob([buffer]);
                const url = window.URL.createObjectURL(blob);
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.style.display = "none";
                a.href = url;
                a.download = file.name;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } else {
            window.open(file.url, "_blank");
        }
    }

    async function showFileAnomalies(file: any) {
        if (!sdk) return;

        const result = await sdk.auditInstance().getAnomaliesForDoc(file.id);
        setAnomalies(result);
        setModalFileId(file.id);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setAnomalies({});
        setModalFileId("");
    }

    function orderBy(type: string) {
        let newOrderDirection = orderType !== type ? "desc" : orderDirection === "asc" ? "desc" : "asc";
        setOrderType(type);
        setOrderDirection(newOrderDirection);

        documents.sort((a: any, b: any) => {
            return newOrderDirection === "asc" ? a[type] - b[type] : b[type] - a[type];
        });
    }

    return (
        <div className={styles["document-list"]}>
            <table className={styles["files"]}>
                <thead>
                    <tr>
                        <th className="text-white text-regular-14">Name</th>
                        <th className="text-white text-regular-14" onClick={() => orderBy("count_conflicts")}>
                            Conflicts number
                        </th>
                        <th className="text-white text-regular-14" onClick={() => orderBy("count_duplicates")}>
                            Duplicates number
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((document: any) => (
                        <tr key={document.id}>
                            <td width="576" className={styles["name-td"]}>
                                <p className="text-white text-regular-14" onClick={() => showFileAnomalies(document)}>
                                    {document.name}
                                </p>
                            </td>
                            <td width="300">
                                <p className="text-white text-regular-14">{document.count_conflicts}</p>
                            </td>
                            <td width="300">
                                <p className="text-white text-regular-14">{document.count_duplicates}</p>
                            </td>
                            <td width="50" className={styles["download"]}>
                                <Image src={downloadIcon} onClick={() => goTo(document)} alt="download"/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <ModalTemplate onClose={closeModal} >
                    {anomalies.conflicts?.length > 0 && (
                        <div>
                            <p className={`text-white text-bold-16 ${styles["title"]}`}>Document Conflicts</p>
                            {anomalies.conflicts.map((document: any) => (
                                <DocumentCard  document={document} key={document.id} credentials={credentials} type="conflict"/>
                            ))}
                        </div>
                    )}
                    {anomalies.duplicated?.length > 0 && (
                        <div>
                            <p className={`text-white text-bold-16 ${styles["title"]}`}>Document Duplicates</p>
                            {anomalies.duplicated.map((document: any) => (
                                <DocumentCard key={document.id} document={document} credentials={credentials} type="duplicate"/>
                            ))}
                        </div>
                    )}
                </ModalTemplate>
                    
            )}
        </div>
    );
}