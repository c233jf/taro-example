import { FC, PropsWithChildren } from 'react'
import { StoreContext, store } from './store/context'

import './app.scss'

const App: FC<PropsWithChildren> = ({ children }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default App
