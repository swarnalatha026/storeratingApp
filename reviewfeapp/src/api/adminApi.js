import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";
const getAuthToken = () => {
    return localStorage.getItem("token"); // Ensure the token is stored as "token" in localStorage
};
// Fetch admin dashboard stats
export const fetchAdminDashboard = async () => {
    const res = await axios.get(`${API_URL}/dashboard`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    console.log("fetchAdminDashboard",res);
    return res.data;
};

// Fetch all users
export const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return res.data;
};

// Fetch user details by ID
export const fetchUserDetails = async (userId) => {
    const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return res.data;
};

// Fetch all stores
export const fetchStores = async () => {
    const res = await axios.get(`${API_URL}/stores`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    return res.data;
};

export const fetchRatings = async () => {
    const res = await axios.get(`${API_URL}/allratings`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    console.log("res.data",res.data);
    return res.data;
};


export const createUser = async (userData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };

    const response = await axios.post(`${API_URL}/users`, userData, config);
    return response.data;
};

// Create a Store
export const createStore = async (storeData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };

    const response = await axios.post(`${API_URL}/stores`, storeData, config);
    return response.data;
};