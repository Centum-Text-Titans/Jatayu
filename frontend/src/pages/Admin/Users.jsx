import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: "", role: "user", password: "" });
    const [deleteUserId, setDeleteUserId] = useState(null); // For delete confirmation modal
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/listUsers`);
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleAddUser = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/addUser`, newUser, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 201) {
                alert("User added successfully!");
                setShowModal(false);
                fetchUsers();
                setNewUser({ username: "", role: "user", password: "" });
            } else {
                alert("Error adding user!");
            }
        } catch (err) {
            console.error("Error adding user:", err);
            alert("Error adding user!");
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUserId) return;

        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/deleteUser/${deleteUserId}`);

            if (response.status === 200) {
                alert("User deleted successfully!");
                fetchUsers();
                setDeleteUserId(null); // Close modal
            } else {
                alert("Error deleting user!");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Error deleting user!");
        }
    };

    const filteredUsers = roleFilter ? users.filter(user => user.role === roleFilter) : users;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Users List</h2>

            {/* Role Dropdown + Add User Button */}
            <div className="flex justify-between mb-4">
                <select className="p-2 border rounded" onChange={(e) => setRoleFilter(e.target.value)} value={roleFilter}>
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="employee">Employee</option>
                </select>
                <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => setShowModal(true)}>
                    + Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Username</th>
                            <th className="border p-2">Role</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="text-center">
                                    <td className="border p-2">{user.id}</td>
                                    <td className="border p-2">{user.username}</td>
                                    <td className="border p-2 capitalize">{user.role}</td>
                                    <td className="border p-2 flex justify-center gap-2">
                                        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => navigate(`/user/${user.id}`)}>
                                            View
                                        </button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => setDeleteUserId(user.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-3 text-center">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New User</h2>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="w-full p-2 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={handleChange}
                            value={newUser.username}
                        />
                        <select
                            name="role"
                            className="w-full p-2 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={handleChange}
                            value={newUser.role}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                        </select>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="w-full p-2 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={handleChange}
                            value={newUser.password}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                onClick={handleAddUser}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Delete Confirmation Modal */}
            {deleteUserId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded shadow-md w-80 text-center">
                        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                        <p className="text-gray-600 mb-4">Are you sure you want to delete this user?</p>
                        <div className="flex justify-center gap-2">
                            <button className="bg-gray-400 px-3 py-1 rounded" onClick={() => setDeleteUserId(null)}>Cancel</button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleDeleteUser}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
