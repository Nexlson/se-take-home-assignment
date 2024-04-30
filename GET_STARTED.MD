 ## To execute locally (node 18 with pnpm install globally on NPM)

 ```
    pnpm i
    pnpm start
 ```

 ## To execute with docker (make sure you have docker setup)
 ```
    bash start.sh
 ```

 ## How it works 
 - Built by using combination of packages such as inquirer (creating interactive cli) and chalker (for cli command styling)
 - Worker logics are built using node's worker_threads lib 

## Possible Improvement 
- Typescript implementation 
- Consider Redis for in-memory storage 
- Consider locks implementation to avoid data concurrent access 
- Better UI 