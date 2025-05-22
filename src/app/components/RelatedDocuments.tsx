import { useAnomalyStore } from '@/store/anomalyStore';
import RelatedDocumentStyles from './../styles/RelatedDocument.module.scss';
import { useState, useMemo, useEffect } from 'react';
import DropdownSelect from './DropdownSelect';
import DocumentCard from './DocumentCard';
import AnomalieOverview from './AnomalieOverview';
import { Anomaly } from '@/types';
import AnomalieGroupedByDoc from './AnomalieGroupedByDoc';
interface RelatedDocumentsProps {
    type: 'conflict' | 'duplicate';
}

export default function RelatedDocuments({ type }: RelatedDocumentsProps) {
    const { conflictInformationList, duplicatedInformationList, conflictInformationWithSearch, duplicatedInformationWithSearch, getConflictInformation, getDuplicatedInformation, resetConflictSearch, resetDuplicatedSearch } = useAnomalyStore();
    const documents = type === 'conflict' ? conflictInformationList : duplicatedInformationList;

    const [menu, setMenu] = useState<'overview' | 'oneByOne' | 'grouped'>('overview');
    const [selectedType, setSelectedType] = useState('All');
    const [subjectToSearch, setSubjectToSearch] = useState('');
    const [searchApplied, setSearchApplied] = useState(false);

    const [typeList, setTypeList] =  useState<string[]>(['All', 'Managed', 'Detected', 'Ignored']);

    const otherTypes = useMemo(() => {
        return typeList.filter(t => t !== selectedType);
    }, [selectedType, typeList]);

    const searchAnomalies = () => {
        if (subjectToSearch.trim() !== '') {
            setSearchApplied(true);
            if (type === 'conflict') {
                getConflictInformation(subjectToSearch);
            } else {
                getDuplicatedInformation(subjectToSearch);
            }
        }
    }

    useEffect(() => {
        if (subjectToSearch === '') {
            setSearchApplied(false);
            if (type === 'conflict') {
                resetConflictSearch();
            } else {
                resetDuplicatedSearch();
            }
        }
    }, [subjectToSearch, type, resetConflictSearch, resetDuplicatedSearch]);

    const documentsToShow = useMemo(() => {
        const documents =
            type === 'conflict'
                ? searchApplied
                    ? [...conflictInformationWithSearch]
                    : [...conflictInformationList]
                : searchApplied
                    ? [...duplicatedInformationWithSearch]
                    : [...duplicatedInformationList];

        if (selectedType === 'All') {
            return documents;
        }

        return documents.filter((document: Anomaly) => 
            document.state === selectedType.toUpperCase()
        );
    }, [type, searchApplied, selectedType, conflictInformationList, duplicatedInformationList, conflictInformationWithSearch, duplicatedInformationWithSearch]);

    const handleSearchChange = (value: string) => {
        setSubjectToSearch(value);
        if (value === '') {
            setSearchApplied(false);
            if (type === 'conflict') {
                resetConflictSearch();
            } else {
                resetDuplicatedSearch();
            }
        }
    };


    return (
        <div className={RelatedDocumentStyles['related-documents']}>
            <div className={RelatedDocumentStyles['tabs']}>
                <p className={`text-regular-14 ${menu === 'overview' ? RelatedDocumentStyles['active'] : ''}`} onClick={() => setMenu('overview')}>
                    Overview by subjects
                </p>
                <p className={`text-regular-14 ${menu === 'oneByOne' ? RelatedDocumentStyles['active'] : ''}`} onClick={() => setMenu('oneByOne')}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} one by one
                </p>
                <p className={`text-regular-14 ${menu === 'grouped' ? RelatedDocumentStyles['active'] : ''}`} onClick={() => setMenu('grouped')}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} grouped by document
                </p>
            </div>

            {menu === 'overview' && (
                <div className={RelatedDocumentStyles['overview']}>
                    <AnomalieOverview type={type} />
                </div>
            )}

            {menu === 'oneByOne' && (
                <div className={RelatedDocumentStyles['one-by-one']}>
                    <div className={RelatedDocumentStyles['top']}>
                        <div className={RelatedDocumentStyles['input-container']}>
                            <input
                                type="text"
                                className={`simple-input-h30 ${RelatedDocumentStyles['search-anomalies']}`}
                                placeholder={`Search anything in ${type}...`}
                                value={subjectToSearch}
                                onChange={(e) => setSubjectToSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchAnomalies()}
                            />
                            <button className="btn-outline-rounded-30" onClick={searchAnomalies}>
                                Search
                            </button>
                        </div>
                        {typeList.length > 0 && documents.length > 0 && <DropdownSelect selected={selectedType} onChange={setSelectedType} options={typeList} />}
                    </div>
                    {documentsToShow.map((element, index) => (
                        <DocumentCard key={`${element.subject}_${index}`} document={element} type={type} />
                    ))}
                </div>
            )}

            {menu === 'grouped' && (
                <div className={RelatedDocumentStyles['grouped']}>
                    <AnomalieGroupedByDoc type={type} />
                </div>
            )}
        </div>
    );
}
