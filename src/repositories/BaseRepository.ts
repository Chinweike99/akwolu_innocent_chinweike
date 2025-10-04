import { FindOptions, Model, ModelStatic, UpdateOptions } from "sequelize";


export abstract class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async findById(id: string, options?: FindOptions): Promise<T | null> {
        return this.model.findByPk(id, options);
    }

    async create(data: any, options?: UpdateOptions): Promise<T> {
        return this.model.create(data, options) as Promise<T>;
    }

    async update(id: string, data: any, options?: UpdateOptions): Promise<[number]> {
        return this.model.update(data, { where: { id }, ...options });
    }
    async delete(id: string, options?: UpdateOptions): Promise<number> {
        return this.model.destroy({ where: { id }, ...options });
    }

    async findAll(options?: FindOptions): Promise<T[]> {
        return this.model.findAll(options);
    }

}