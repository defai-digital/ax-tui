import { EventEmitter } from "events"
/** Data paths. */
export interface DataPaths {
  globalConfigPath: string
  globalConfigFile: string
  localConfigFile: string
  globalDataPath: string
}
/** Data paths events. */
export interface DataPathsEvents {
  "paths:changed": [paths: DataPaths]
}
/** Data paths manager class. */
export declare class DataPathsManager extends EventEmitter<DataPathsEvents> {
  private _appName
  private _globalConfigPath?
  private _globalConfigFile?
  private _localConfigFile?
  private _globalDataPath?
  constructor()
  get appName(): string
  set appName(value: string)
  get globalConfigPath(): string
  get globalConfigFile(): string
  get localConfigFile(): string
  get globalDataPath(): string
  toObject(): DataPaths
}
/** Get data paths. */
export declare function getDataPaths(): DataPathsManager
