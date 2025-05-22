import { create } from 'zustand';
import { KaiStudio } from 'kaistudio-sdk-js';
import { Document, Anomaly } from '@/types';


interface AnomalyState {
    sdk: KaiStudio | null;
    documentsToManageList: Document[];
    conflictInformationList: Anomaly[];
    duplicatedInformationList: Anomaly[];
    conflictInformationWithSearch: Anomaly[];
    duplicatedInformationWithSearch: Anomaly[];
    missingSubjects: any[];
    init: (organizationId: string, instanceId: string, apiKey: string, host: string) => Promise<void>;
    resetConflictSearch: () => void;
    resetDuplicatedSearch: () => void;
    getDocumentsToManageList: () => Promise<void>;
    getConflictInformation: (query: string) => Promise<void>;
    getDuplicatedInformation: (query: string) => Promise<void>;
    getMissingSubjectList: () => Promise<void>;
    setConflictState: (conflictId: string, state: string) => Promise<void>;
    setDuplicateState: (duplicateId: string, state: string) => Promise<void>;
}

export const useAnomalyStore = create<AnomalyState>((set, get) => ({
    sdk: null,
    documentsToManageList: [],
    conflictInformationList: [],
    duplicatedInformationList: [],
    conflictDocumentList: [],
    duplicatedDocumentList: [],
    missingSubjects: [],
    conflictInformationWithSearch: [],
    duplicatedInformationWithSearch: [],

    init: async (organizationId: string, instanceId: string, apiKey: string, host: string) => {
        const sdk = new KaiStudio({
            organizationId,
            instanceId,
            apiKey,
            host,
        });
        set({ sdk });
    },

    resetConflictSearch: () => {
        set({ conflictInformationWithSearch: [] });
    },

    resetDuplicatedSearch: () => {
        set({ duplicatedInformationWithSearch: [] });
    },

    getConflictInformation: async (query: string = '') => {
        const { sdk } = get();
        if (!sdk) return;

        if (query != '') {
            set({ conflictInformationWithSearch: [] });
        }

        let offset = 0;
        const limit = 20;
        const documents: Anomaly[] = [];

        while (true) {
            try {
                const result = await sdk.auditInstance().getConflictInformation(limit, offset, query);
                if (result && result.length > 0) {
                    for (const document of result) {
                        if (document && document.docsRef && document.docsRef.length) {
                            documents.push(document);
                        }
                    }
                    offset += limit;
                    if (result.length < limit) break;
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error fetching conflict information:', error);
                break;
            }
        }

        if (query == '') {
            set({ conflictInformationList: documents });
        } else {
            set({ conflictInformationWithSearch: documents });
        }
    },

    getDuplicatedInformation: async (query: string = '') => {
        const { sdk } = get();
        if (!sdk) return;

        let offset = 0;
        const limit = 20;
        const documents: Anomaly[] = [];

        while (true) {
            try {
                const result = await sdk.auditInstance().getDuplicatedInformation(limit, offset, query);
                if (result && result.length > 0) {
                    for (const document of result) {
                        if (document && document.docsRef && document.docsRef.length) {
                            documents.push(document);
                        }
                    }
                    offset += limit;
                    if (result.length < limit) break;
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error fetching duplicated information:', error);
                break;
            }
        }

        if(query == '') {
            set({ duplicatedInformationList: documents });
        } else {
            set({ duplicatedInformationWithSearch: documents });
        }
    },

    getDocumentsToManageList: async () => {
        const { sdk } = get();
        if (!sdk) return;

        let offset = 0;
        const limit = 20;
        const documents: Document[] = [];

        while (true) {
            try {
                const result = await sdk.auditInstance().getDocumentsToManageList(limit, offset);
                if (result && result.length > 0) {
                    for (const document of result) {
                        if (document) {
                            documents.push(document);
                        }
                    }
                    offset += limit;
                    if (result.length < limit) break;
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error fetching documents to manage:', error);
                break;
            }
        }

        set({ documentsToManageList: documents });
    },

    getMissingSubjectList: async () => {
        const { sdk } = get();
        if (!sdk) return;

        let offset = 0;
        const limit = 20;
        const subjects: any[] = [];

        while (true) {
            try {
                const result = await sdk.auditInstance().getMissingSubjectList(limit, offset);
                if (result && result.length > 0) {
                    for (const subject of result) {
                        if (subject) {
                            subjects.push(subject);
                        }
                    }
                    offset += limit;
                    if (result.length < limit) break;
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error fetching missing subjects:', error);
                break;
            }
        }

        set({ missingSubjects: subjects });
    },

    setConflictState: async (conflictId: string, state: string) => {
        const { sdk } = get();
        if (!sdk) return;

        try {
            await sdk.auditInstance().conflictInformationSetState(conflictId, state);
            const { conflictInformationList } = get();
            const updatedList = conflictInformationList.map(item => 
                item.id === conflictId 
                    ? { ...item, state: state.toUpperCase() } 
                    : item
            );
            set({ conflictInformationList: updatedList });
        } catch (error) {
            console.error('Error setting conflict state:', error);
        }
    },

    setDuplicateState: async (duplicateId: string, state: string) => {
        const { sdk } = get();
        if (!sdk) return;

        try {
            await sdk.auditInstance().duplicatedInformationSetState(duplicateId, state);
            const { duplicatedInformationList } = get();
            const updatedList = duplicatedInformationList.map(item => 
                item.id === duplicateId 
                    ? { ...item, state: state.toUpperCase() } 
                    : item
            );
            set({ duplicatedInformationList: updatedList });
        } catch (error) {
            console.error('Error setting duplicate state:', error);
        }
    },
}));

