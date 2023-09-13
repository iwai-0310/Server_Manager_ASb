import { DataState} from "../enum/data-state.enum";

export interface AppState<T>{
    dataState:DataState;
    appDate?: T;
    error?:string;
}