import styles from "./../styles/MissingSubject.module.scss"

export function MissingSubjectCard({subject}) {
    return (
        <div className={styles['missing-subject']}>
            <div className={styles.top}>
                <p className={"text-white text-bold-14"}>Subject: {subject.subject}</p>
            </div>
            <div className={styles.information}>
                <p className={"text-bold-14 text-grey " + styles['needed-information']}>Needed information:</p>
                <p className={"text-regular-14 text-white"}>Subject: {subject.information_needed}</p>
            </div>
            <div className={styles.questions}>
                <p className={"text-bold-14 text-grey " + styles.question}>Questions:</p>
                {subject.questions.map((question: string, index: number) => {
                    return <p className={"text-regular-14 text-white " + styles.question} key={question + '_' + index}>· {question}</p>
                })}
            </div>
        </div>
    );
}
