import { DataSource } from 'typeorm';
import { getDataSourceOptions } from './database.config';

// The CLI uses this default export
export default new DataSource(getDataSourceOptions('migrator'));
