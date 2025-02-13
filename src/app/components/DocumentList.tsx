import styles from "../styles/DocumentList.module.scss"
import axios from "axios"

export function DocumentList({credentials, documents}) {

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
                baseUrl = `https://api.kai-studio.ai`
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
                method: 'POST',
                headers: headers,
                data: {
                    id: file.id
                }
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

    return (
        documents && <div className={styles['document-list']}>
            <table className={styles['files']}>
                <thead>
                <tr>
                    <th className={"text-white text-regular-14"}>
                        Name
                    </th>
                    <th className={"text-white text-regular-14"}>
                        Conflicts number
                    </th>
                    <th className={"text-white text-regular-14"}>
                        Duplicates number
                    </th>
                </tr>
                </thead>
                <tbody>{documents.map((document: any) => {
                    return <tr key={document.id}>
                        <td width="576" className={styles['name-td']}>
                            <p className={" text-white text-regular-14"} onClick={() => goTo(document)}>{document.name}</p>
                        </td>
                        <td width="300">
                            <p className={" text-white text-regular-14"}>{document.count_conflicts}</p>
                        </td>
                        <td width="300">
                            <p className={" text-white text-regular-14"}>{document.count_duplicates}</p>
                        </td>
                    </tr>;
                })}
                </tbody>
            </table>
        </div>
    );
}
