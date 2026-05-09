import axiosInstance from "./axiosInstance";

export const loginMember = async (email, password) => {
    try {
        const response = await axiosInstance.post("/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const GetMember = async (id) => {
    try {
        const response = await axiosInstance.get("/Member/" + id);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const getCheckInByMemberId = async (id) => {
    try {
        const response = await axiosInstance.get("/CheckIn/member-check-in/" + id);
        return response.data;
    } catch (error) {
        throw error;
    }
}