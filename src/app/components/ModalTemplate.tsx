import React from 'react';
import styles from '../styles/ModalTemplate.module.scss';
import Image from 'next/image';
import closeImg from 'kai-asset/icons/close-small.svg';
interface ModalTemplateProps {
    onClose: () => void;
    children: React.ReactNode;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({ onClose, children }) => {
    return (
        <div className={styles['modal-container']}>
            <div className={styles['modal-bg']} onClick={onClose} />
            <div className={styles['modal']}>
                <div className={styles['close-button']} >
                    <Image src={closeImg} onClick={onClose} alt="Close button" width={24} height={24} />
                </div>
                <div className={styles['modal-body']}>{children}</div>
            </div>
        </div>
    );
};

export default ModalTemplate;
