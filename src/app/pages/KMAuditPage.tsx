import styles from "@/app/styles/KMAudit.module.scss";
import {useEffect, useRef, useState} from "react";
import {DocumentList} from "@/app/components/DocumentList";
import {KaiStudio} from "sdk-js";
import {DocumentCard} from "../components/DocumentCard";
import {MissingSubjectCard} from "@/app/components/MissingSubjectCard";

export interface DocumentToManage {
    id: string,
    name: string,
    url: string
}

export default function KMAuditPage(credentials: any) {
    const [menu, setMenu] = useState("toManage")
    const [selectedType, setSelectedType] = useState("All")
    const oldMenu = useRef("")
    const [loaded, setLoaded] = useState(false)
    const [documentToManageList, setDocumentToManageList] = useState<DocumentToManage[]>([])
    const [conflictInformationList, setConflictInformationList] = useState<any[]>([])
    const [duplicatedInformationList, setDuplicatedInformationList] = useState<any[]>([])
    const [missingSubjects, setMissingSubjects] = useState<any[]>([])
    const [relatedDocumentList, setRelatedDocumentList] = useState<any[]>([])
    const [documentToShow, setDocumentToShow] = useState<any[]>([])
    const typeList = useRef(["All", "Managed", "Detected"])

    let documentToManageTmp: DocumentToManage[] = []
    let conflictInformationListTmp: any[] = []
    let duplicatedInformationListTmp: any[] = []
    let missingSubjectsTmp: any[] = []

    useEffect(() => {
        if (oldMenu.current != menu) {
            let fetchData
            setLoaded(false)
            fetchData = async () => {
                let data
                switch (menu) {
                    case "toManage":
                        data = await getDocumentsToManageList(20, 0)
                        break
                    case "conflict":
                        data = await getConflictInformation(20, 0)
                        break
                    case "duplicate":
                        data = await getDuplicateInformation(20, 0)
                        break
                    case "subject":
                        data = await getMissingSubjectList(20, 0)
                }
            }
            fetchData()
            oldMenu.current = menu
            setLoaded(true)
        }
    }, [menu]);

    useEffect(() => {
        setRelatedDocumentList(menu == 'conflict' ? conflictInformationList : duplicatedInformationList)
    }, [menu, conflictInformationList.length, duplicatedInformationList.length])

    useEffect(() => {
        if (selectedType == 'All') {
            setDocumentToShow(relatedDocumentList)
        } else {
            let list = relatedDocumentList.filter((document: any) => {
                return document.state == selectedType.toUpperCase()
            })
            setDocumentToShow(list)
        }
    }, [selectedType, relatedDocumentList])


    let sdk: any = null
    const organizationId = process.env.NEXT_PUBLIC_APP_ORGANIZATION_ID ?? (credentials.organizationId ?? "")
    const instanceId = process.env.NEXT_PUBLIC_APP_INSTANCE_ID ?? (credentials.instanceId ?? "")
    const apiKey = process.env.NEXT_PUBLIC_APP_API_KEY ?? (credentials.apiKey ?? "")
    const host = process.env.NEXT_PUBLIC_HOST_URL

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

    const getDocumentsToManageList = async (limit: number, initialOffset: number) => {
        if (!sdk) {
            return
        }

        if (initialOffset == 0) {
            documentToManageTmp = []
        }

        let offset = initialOffset
        sdk?.auditInstance().getDocumentsToManageList(20, offset).then(async (result: any[]) => {
            result.forEach(el => {
                documentToManageTmp.push(el)
            })

            if (result && result.length == limit) {
                offset = offset + limit
                await getDocumentsToManageList(20, offset)
            } else {
                setDocumentToManageList(documentToManageTmp)
            }
        })
    }

    async function getConflictInformation(limit: number, initialOffset: number) {
        if (!sdk) {
            return
        }

        if (initialOffset == 0) {
            conflictInformationListTmp = []
        }

        let offset = initialOffset
        let result = await sdk?.auditInstance().getConflictInformation(20, offset)
        if (result) {
            for (let index = 0; index < result.length; index++) {
                let document = result[index]
                if (document && document.docsRef && document.docsRef.length) {
                    conflictInformationListTmp.push(document)
                }
            }
        }
        if (result && result.length == limit) {
            offset = offset + limit
            await getConflictInformation(20, offset)
        } else {
            setConflictInformationList(conflictInformationListTmp)
        }
    }

    async function getDuplicateInformation(limit: number, initialOffset: number) {
        if (!sdk) {
            return
        }

        if (initialOffset == 0) {
            duplicatedInformationListTmp = []
        }

        let offset = initialOffset
        let result = await sdk?.auditInstance().getDuplicatedInformation(20, offset)
        if (result) {
            for (let index = 0; index < result.length; index++) {
                let document = result[index]
                if (document && document.docsRef && document.docsRef.length) {
                    duplicatedInformationListTmp.push(document)
                }
            }
        }
        if (result && result.length == limit) {
            offset = offset + limit
            await getDuplicateInformation(20, offset)
        } else {
            setDuplicatedInformationList(duplicatedInformationListTmp)
        }
    }

    async function getMissingSubjectList(limit: number, initialOffset: number) {
        if (!sdk) {
            return
        }

        if (initialOffset == 0) {
            missingSubjectsTmp = []
        }

        let offset = initialOffset
        await sdk?.auditInstance().getMissingSubjectList(20, offset).then(async (result: any[]) => {
            if (result) {
                result.forEach(document => {
                    if (document) {
                        missingSubjectsTmp.push(document)
                    }
                })

            }

            if (result && result.length == limit) {
                offset = offset + limit
                await getMissingSubjectList(20, offset)
            } else {
                setMissingSubjects(missingSubjectsTmp)
            }
        })
    }


    const setTab = (tab: string) => {
        setMenu(tab)
    }

    return (
        <div className={styles['km-audit-page']}>
            <div className={styles['tabs']}>
                <p className={["text-regular-16 text-white ", menu == 'toManage' ? styles.active : ''].join('')}
                   onClick={() => setTab("toManage")}>Documents to manage</p>
                <p className={["text-regular-16 text-white  ", menu == 'conflict' ? styles.active : ''].join('')}
                   onClick={() => setTab("conflict")}>Conflict information</p>
                <p className={["text-regular-16 text-white  ", menu == 'duplicate' ? styles.active : ''].join('')}
                   onClick={() => setTab("duplicate")}>Duplicate information</p>
                <p className={["text-regular-16 text-white  ", menu == 'subject' ? styles.active : ''].join('')}
                   onClick={() => setTab("subject")}>Missing subjects</p>
            </div>
            {loaded && menu == "toManage" && <div className={styles["documents-to-manage"]}>
                <p className={"text-white text-bold-20 " + styles['sub-title']}>Documents to manage</p>
                <DocumentList documents={documentToManageList} credentials={credentials}></DocumentList>
            </div>}
            {(menu == 'conflict' || menu == 'duplicate') && loaded &&
                <div className={styles["related-documents"]} key={menu}>
                    <p className={"text-white text-bold-20 " + styles['sub-title']}>{menu == 'conflict' ? "Conflict information" : "Duplicate information"}</p>
                    <div>
                        {documentToShow.map((file: any, index: number) => {
                            return <DocumentCard file={file} credentials={credentials} type={menu}
                                                 key={file.subject + '_' + file.status + '_' + index}></DocumentCard>
                        })}
                    </div>
                </div>}
            {(menu == 'subject') && loaded &&
                <div className={styles["missing-subjects"]}>
                    <p className={"text-white text-bold-20 " + styles['sub-title']}>Missing subjects</p>
                    {
                        missingSubjects.map((subject: any) => {
                            return <MissingSubjectCard subject={subject} key={subject.subject}></MissingSubjectCard>
                        })
                    }
                </div>}
        </div>
    );
}
