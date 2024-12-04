import { useState, useEffect } from 'react';

// Custom Hook to fetch current logged-in user's data
const useAuth = () => {
    const [user, setUser] = useState({});
    const userFromStorage = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Get the user from localStorage when the component mounts
        // console.log(userFromStorage);
        if (userFromStorage) {
            setUser(userFromStorage);  // Set the user data in state
        } else {
            setUser(null);  // If no user found, set user to null
        }
    }, [userFromStorage]);  // Empty dependency array means this runs only once when the component mounts

    // Return the user data or null if not logged in
    return user;
};

export default useAuth;
