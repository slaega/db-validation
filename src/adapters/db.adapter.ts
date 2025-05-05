export interface DBAdapter {
    findFirst(
        model: string,
        where: any
    ): Promise<any>;


    count(
        model: string,
        where: any
    ): Promise<any>;
}
