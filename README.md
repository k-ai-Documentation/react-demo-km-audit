# React-demo-search

## Introduction
This is a next.js demo shows you how to install and use sdk-js to send request and get response.

## Before setup
Clone [react-demo-km-audit](https://github.com/k-ai-Documentation/react-demo-km-audit).

Open terminal and run
```
cd react-demo-search
```
Add fill your keys in .env.development file.

If you are using SaaS version, you need 3 keys(organizationId, instanceId, apiKey).

If you are using Premise version, you need host and api key(optional).

See More about SaaS and Premise version in [here](https://github.com/k-ai-Documentation/sdk-js#usage-guide).
```
# if you are using saas 
NEXT_PUBLIC_APP_ORGANIZATION_ID = ''
NEXT_PUBLIC_APP_INSTANCE_ID = ''
NEXT_PUBLIC_APP_API_KEY = ''

# if you are using version premise. You must need host, but api key is optional, depends on your enterprise settings. 
NEXT_PUBLIC_HOST_URL = ''
NEXT_PUBLIC_APP_API_KEY = ''
```
## Installation
```
npm install
```
### Compiles and hot-reloads for development
```
npm run dev
```


## play
Open your browser and go to http://localhost:3000/

Have fun!

# How to use sdk-js

```
npm install
```
+ check in your package.json and node_modules, sdk-js should be installed.

+ check .env.development has NEXT_PUBLIC_APP_ORGANIZATION_ID, NEXT_PUBLIC_APP_INSTANCE_ID and NEXT_PUBLIC_APP_API_KEY.

+ in your tsx file, import sdk-js.
```
import { KaiStudio } from 'kaistudio-sdk-js';

```
+ Create your sdk instance
````
const sdk = new KaiStudio({
    organizationId: process.env.NEXT_PUBLIC_APP_ORGANIZATION_ID,
    instanceId: process.env.NEXT_PUBLIC_APP_INSTANCE_ID,
    apiKey: process.NEXT_PUBLIC_APP_API_KEY,
});
````

+ use it in your methods
```
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
```
