import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
export const workspace=fileURLToPath(new URL('./',import.meta.url));
export const repositoryRoot=fileURLToPath(new URL('../',import.meta.url));
export const datasetRoot=path.join(workspace,'dataset');
export const repoModule=relative=>import(pathToFileURL(path.join(repositoryRoot,relative)).href);
export const sourceCommit='0ef93d16d70ce9633451acd8612c8e5ac39c11b1';
