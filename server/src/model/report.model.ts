export interface Report {
    id: number;
    ownerId: number;
    fileName: string;
    path: string;
    createdAt: string;
    sharedWith: number[];
}