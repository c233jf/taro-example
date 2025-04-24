import { createContext, useContext } from 'react'
import counterStore from './counter'

export interface IStore {
  counterStore: typeof counterStore
}

export const store = {
  counterStore
}

export const StoreContext = createContext<IStore>(store)

export const useStoreContext = () => useContext(StoreContext) 