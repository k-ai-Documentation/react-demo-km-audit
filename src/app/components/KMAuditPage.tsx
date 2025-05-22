'use client';
import { useState, useEffect, useCallback } from 'react';
import Collapse from '@/app/components/Collapse';
import DocumentList from '@/app/components/DocumentList';
import MissingSubjectCard from '@/app/components/MissingSubjectCard';
import Loader from '@/app/components/Loader';
import RelatedDocuments from '@/app/components/RelatedDocuments';
import { useAnomalyStore } from '@/store/anomalyStore';

interface CollapseMenu {
    documentsToManage: boolean;
    conflict: boolean;
    duplicate: boolean;
    missingSubjects: boolean;
}

export default function KMAuditPage() {
    const [collapseMenu, setCollapseMenu] = useState<CollapseMenu>({
        documentsToManage: false,
        conflict: false,
        duplicate: false,
        missingSubjects: false,
    });

    const [loadingStates, setLoadingStates] = useState({
        documentsToManage: false,
        conflict: false,
        duplicate: false,
        missingSubjects: false,
    });

    const {
        documentsToManageList,
        missingSubjects,
        init,
        conflictInformationList,
        duplicatedInformationList,
        getDocumentsToManageList,
        getConflictInformation,
        getDuplicatedInformation,
        getMissingSubjectList,
    } = useAnomalyStore();

    const toggleCollapseMenu = useCallback((type: keyof CollapseMenu) => {
        setCollapseMenu((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    }, []);

    useEffect(() => {
        const initializeData = async () => {
            setLoadingStates((prev) => ({ ...prev, documentsToManage: true }));
            const organizationId = process.env.NEXT_PUBLIC_ORGANIZATION_ID ?? '';
            const instanceId = process.env.NEXT_PUBLIC_INSTANCE_ID ?? '';
            const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? '';
            const host = process.env.NEXT_PUBLIC_HOST_URL ?? '';

            await init(organizationId, instanceId, apiKey, host);
            setLoadingStates((prev) => ({ ...prev, documentsToManage: false }));
        };

        initializeData();
    }, [init]);

    useEffect(() => {
        const loadData = async () => {
            if (collapseMenu.documentsToManage) {
                setLoadingStates((prev) => ({ ...prev, documentsToManage: true }));
                await getDocumentsToManageList();
                setLoadingStates((prev) => ({ ...prev, documentsToManage: false }));
            }
        };
        loadData();
    }, [collapseMenu.documentsToManage, getDocumentsToManageList]);

    useEffect(() => {
        const loadData = async () => {
            if (collapseMenu.conflict) {
                setLoadingStates((prev) => ({ ...prev, conflict: true }));
                await getConflictInformation('');
                setLoadingStates((prev) => ({ ...prev, conflict: false }));
            }
        };
        loadData();
    }, [collapseMenu.conflict, getConflictInformation]);

    useEffect(() => {
        const loadData = async () => {
            if (collapseMenu.duplicate) {
                setLoadingStates((prev) => ({ ...prev, duplicate: true }));
                await getDuplicatedInformation('');
                setLoadingStates((prev) => ({ ...prev, duplicate: false }));
            }
        };
        loadData();
    }, [collapseMenu.duplicate, getDuplicatedInformation]);

    useEffect(() => {
        const loadData = async () => {
            if (collapseMenu.missingSubjects) {
                setLoadingStates((prev) => ({ ...prev, missingSubjects: true }));
                await getMissingSubjectList();
                setLoadingStates((prev) => ({ ...prev, missingSubjects: false }));
            }
        };
        loadData();
    }, [collapseMenu.missingSubjects, getMissingSubjectList]);

    const showNoResult =
        (!missingSubjects?.length && collapseMenu.missingSubjects) ||
        (!documentsToManageList?.length && collapseMenu.documentsToManage) ||
        (!conflictInformationList?.length && collapseMenu.conflict) ||
        (!duplicatedInformationList?.length && collapseMenu.duplicate && !Object.values(loadingStates).some((state) => state));

    return (
        <div className="km-audit-page">
            <Collapse defaultOpen={collapseMenu.documentsToManage} onToggle={() => toggleCollapseMenu('documentsToManage')} title={<p className="text-white text-medium-16">Documents to manage</p>}>
                {documentsToManageList?.length > 0 && <DocumentList />}
                {loadingStates.documentsToManage && <Loader className="loader-block" color="white" />}
            </Collapse>

            <Collapse defaultOpen={collapseMenu.conflict} onToggle={() => toggleCollapseMenu('conflict')} title={<p className="text-white text-medium-16">Conflicts</p>}>
                {conflictInformationList?.length > 0 && <RelatedDocuments type="conflict" />}
                {loadingStates.conflict && <Loader className="loader-block" color="white" />}
            </Collapse>

            <Collapse defaultOpen={collapseMenu.duplicate} onToggle={() => toggleCollapseMenu('duplicate')} title={<p className="text-white text-medium-16">Duplicates</p>}>
                {duplicatedInformationList?.length > 0 && <RelatedDocuments type="duplicate" />}
                {loadingStates.duplicate && <Loader className="loader-block" color="white" />}
            </Collapse>

            <Collapse defaultOpen={collapseMenu.missingSubjects} onToggle={() => toggleCollapseMenu('missingSubjects')} title={<p className="text-white text-medium-16">Missing subjects</p>}>
                {missingSubjects?.length > 0 && (
                    <div className="missing-subjects">
                        {missingSubjects.map((subject, index) => (
                            <MissingSubjectCard key={index} subject={subject} />
                        ))}
                    </div>
                )}
                {loadingStates.missingSubjects && <Loader className="loader-block" color="white" />}
            </Collapse>

            {showNoResult && <p className="notification text-grey text-regular-14">No result</p>}

            <style jsx>{`
                .km-audit-page :global(.collapse) {
                    margin-bottom: 40px;
                }
                .loader-block {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
