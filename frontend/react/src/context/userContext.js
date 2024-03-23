import { createContext, useEffect, useState } from "react"

export const UserContext = createContext()

export const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserLoading, setCurrentUserLoading] = useState(true)

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, currentUserLoading, setCurrentUserLoading }}>
      {children}
    </UserContext.Provider>
  )
}
