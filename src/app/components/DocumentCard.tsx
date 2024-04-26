import styles from "./../styles/DocumentCard.module.scss"
import {KaiStudio} from "sdk-js";
import axios from 'axios'
import {useState} from "react";

export function DocumentCard({file, credentials, type}) {

    let sdk: any = null
    const organizationId = process.env.NEXT_PUBLIC_APP_ORGANIZATION_ID ?? (credentials.organizationId ?? "")
    const instanceId = process.env.NEXT_PUBLIC_APP_INSTANCE_ID ?? (credentials.instanceId ?? "")
    const apiKey = process.env.NEXT_PUBLIC_APP_API_KEY ?? (credentials.apiKey ?? "")
    const host = process.env.NEXT_PUBLIC_HOST_URL
    const [state, setState] = useState(file.state)

    credentials = {
        organizationId: organizationId ?? '',
        instanceId: instanceId ?? '',
        apiKey: apiKey ?? '',
        host: host ?? ''
    }

    if (organizationId && instanceId && apiKey) {
        sdk = new KaiStudio({
            organizationId: organizationId,
            instanceId: instanceId,
            apiKey: apiKey
        })
    } else if (host) {
        sdk = new KaiStudio({
            host: host,
            apiKey: apiKey
        })
    }

    async function goTo(file: any) {
        if (file.url && file.url.indexOf("/api/orchestrator/files/download") != -1) {

            let hostUrl = process.env.VITE_HOST_URL
            let baseUrl = ""
            let headers = {}

            if (hostUrl) {
                baseUrl = process.env.VITE_HOST_URL ?? ""
                headers = {
                    'Content-Type': 'application/json',
                }

            } else if (credentials && credentials.organizationId && credentials.instanceId) {
                baseUrl = `https://${credentials.organizationId}.kai-studio.ai/${credentials.instanceId}`
                headers = {
                    'organization-id': credentials.organizationId,
                    'instance-id': credentials.instanceId,
                    'api-key': credentials.apiKey
                }
            }

            if (!baseUrl) {
                return
            }

            const result = await axios({
                url: `${baseUrl}` + file.url,
                method: 'GET',
                headers: headers
            })

            if (result && result.data) {
                const buffer = Buffer.from(result.data.response);
                const blob = new Blob([buffer]);
                const url = window.URL.createObjectURL(blob);
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.setAttribute('style', "display: none")
                a.href = url;
                a.download = file.name;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } else {
            window.open(file.url, '_blank')
        }
    }

    async function setManaged() {
        switch (type) {
            case "conflict":
                await setConflictManaged(file.id)
                break
            case "duplicate":
                await setDuplicateManaged(file.id)
                break
        }
    }

    async function setDuplicateManaged(documentId: number) {
        if (!sdk) {
            return
        }
        let result = await sdk?.auditInstance().setDuplicatedInformationManaged(documentId)
        setState("MANAGED")
    }

    async function setConflictManaged(documentId: number) {
        if (!sdk) {
            return
        }
        let result = await sdk?.auditInstance().setConflictManaged(documentId)
        setState("MANAGED")
    }


    function informationMerge(file: any) {
        const docsRef = file.docsRef
        const documents = file.documents
        let toReturn: any = []
        if (docsRef && documents) {
            docsRef.forEach((docRef: any) => {
                documents.forEach((doc: any) => {
                    if (docRef.id == doc.docId) {
                        let matchedResult = {
                            ...docRef, information_involved: doc.information_involved
                        }
                        toReturn.push(matchedResult)
                    }
                })
            })
        }
        return toReturn
    }

    return (
        <div className={styles['document-card']} key={file.subject + '_' + file.status}>
            <div className={styles.top}>
                <p className={"text-white text-bold-14"}>Subject: {file.subject}</p>
                <p className={"text-white"}>
                    <span className={"text-regular-14"}>State:</span>
                    <span className={"text-bold-14 state"}>{file.state}</span>
                </p>
            </div>
            {informationMerge(file).map((element: any, index: number) => {
                return <div className={styles.information} key={element.name  + '_' + index}>
                    <p className={"text-bold-14 text-white " + styles.name}
                       onClick={() => goTo(element)}>{element.name}</p>
                    <p className={"text-bold-14 text-grey " + styles['involved-information']}>Involved
                        information:</p>
                    <p className={"text-regular-14 text-white " + styles.detail}>{element.information_involved}</p>
                </div>
            })}
            {
                state != 'MANAGED' && <div className={styles['bottom']}>
                    <button className={'btn-icon-text'} onClick={() => setManaged()}>Set managed</button>
                </div>
            }
        </div>
    );
}
