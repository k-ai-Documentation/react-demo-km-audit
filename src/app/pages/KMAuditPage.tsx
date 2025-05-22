import styles from "@/app/styles/KMAudit.module.scss";
import {useEffect, useRef, useState} from "react";
import DocumentList from "@/app/components/DocumentList";
import {KaiStudio} from "kaistudio-sdk-js";
import DocumentCard from "../components/DocumentCard";
import MissingSubjectCard from "@/app/components/MissingSubjectCard";
import { useAnomalyStore } from "@/store/anomalyStore";

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
    const [relatedDocumentList, setRelatedDocumentList] = useState<any[]>([])
    const [documentToShow, setDocumentToShow] = useState<any[]>([])
    const typeList = useRef(["All", "Managed", "Detected"])

    const {getConflictInformation, getDocumentsToManageList , getMissingSubjectList, getDuplicatedInformation, duplicatedInformationList, conflictInformationList, missingSubjects} = useAnomalyStore()

    useEffect(() => {
        if (oldMenu.current != menu) {
            let fetchData
            setLoaded(false)
            fetchData = async () => {
                let data
                switch (menu) {
                    case "toManage":
                        data = await getDocumentsToManageList()
                        break
                    case "conflict":
                        data = await getConflictInformation('')
                        break
                    case "duplicate":
                        data = await getDuplicatedInformation('')
                        break
                    case "subject":
                        data = await getMissingSubjectList()
                }
            }
            fetchData()
            oldMenu.current = menu
            setLoaded(true)
        }
    }, [menu, getConflictInformation, getDocumentsToManageList, getMissingSubjectList, getDuplicatedInformation]);

    useEffect(() => {
        setRelatedDocumentList(menu == 'conflict' ? conflictInformationList : duplicatedInformationList)
    }, [menu, conflictInformationList.length, duplicatedInformationList.length, conflictInformationList, duplicatedInformationList])

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
                <DocumentList></DocumentList>
            </div>}
            {(menu == 'conflict' || menu == 'duplicate') && loaded &&
                <div className={styles["related-documents"]} key={menu}>
                    <p className={"text-white text-bold-20 " + styles['sub-title']}>{menu == 'conflict' ? "Conflict information" : "Duplicate information"}</p>
                    <div>
                        {documentToShow.map((file: any, index: number) => {
                            return <DocumentCard document={file} type={menu}
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
