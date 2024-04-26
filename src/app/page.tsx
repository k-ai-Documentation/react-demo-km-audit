'use client'
import styles from "./styles/KMAudit.module.scss"
import KMAuditPage from "./pages/KMAuditPage"

export default function Home() {
    return (
        <div className={styles['app-demo']}>
            <div className={'header text-regular-32'}>
                <p className={"text-white"}>KM Audit Demo</p>
            </div>
            <KMAuditPage></KMAuditPage>
        </div>
    );
}
