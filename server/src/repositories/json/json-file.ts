import fs from "fs";

// Lee un fichero JSON que contiene un array. Si el fichero no existe o está vacío
// se trata como un array vacío, para no romper el servidor con una base de datos recién creada.
export function readJsonArray<T>(filePath: string): T[] {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const content = fs.readFileSync(filePath, "utf-8").trim();
    return content === "" ? [] : JSON.parse(content);
}

export function writeJsonArray<T>(filePath: string, items: T[]): void {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
}
