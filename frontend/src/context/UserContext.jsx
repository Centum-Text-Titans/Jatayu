/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

// Create UserContext
export const UserContext = createContext();

// Export the provider separately
export const UserProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);

    return (
        <UserContext.Provider value={{ loggedIn, setLoggedIn, userRole, setUserRole, userName, setUserName }}>
            {children}
        </UserContext.Provider>
    );
};
