export interface DatabaseService {
    findFirst(
        model: string,
        where: any
    ): Promise<any>;
}
