'use client';
import { ReactNode } from 'react';
import Image from 'next/image';
import closeIcon from 'kai-asset/icons/close-small.svg';
import modalStyles from './../styles/ModalTemplate.module.scss'

interface ModalTemplateProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function ModalTemplate({ isOpen, onClose, title, children }: ModalTemplateProps) {
    if (!isOpen) return null;

    return (
        <div className={modalStyles['modal']}>
            <div className={modalStyles["close-button"]}>
                <Image onClick={onClose} src={closeIcon} alt="Close" width={24} height={24} />
            </div>
            <div className={modalStyles["modal-body"]}>{children}</div>
        </div>
    );
}
