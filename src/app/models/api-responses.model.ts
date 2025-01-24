export interface UpdateStandardResponse {
    message: string;
}

export interface InsertStandardResult {
    fieldCount: number;     // Number of fields in the result (always 0 for INSERT)
    affectedRows: number;   // Number of rows affected by the query (should be 1 for successful INSERT)
    insertId: number;       // ID of the inserted row (if the table has an auto-increment primary key)
    info: string;           // Additional info about the query (usually empty for INSERT)
    serverStatus: number;   // Server status after the query (e.g., 2 means OK)
    warningStatus: number;  // Number of warnings (should be 0 for successful INSERT)
    changedRows: number;    // Number of rows changed (always 0 for INSERT)
}

export interface DeleteStandardResponse {
    message: string;
}