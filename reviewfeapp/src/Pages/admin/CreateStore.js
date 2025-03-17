import { useState } from "react";
import { createStore } from "../../api/adminApi";
import { useSelector } from "react-redux";
import './styles/TTable.css';
const CreateStorePage = () => {
    const [formData, setFormData] = useState({ store_name: "", email: "", address: "", owner_email: "" });
    const { user,token } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createStore(formData, token);
            alert("Store created successfully!");
            setFormData({ store_name: "", email: "", address: "", owner_email: "" });
        } catch (error) {
            alert(error.response?.data?.message || "Error creating store");
        }
    };

    return (
        <div className="form-container">
            <h2>Create Store</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        type="text" 
                        name="store_name" 
                        placeholder="Store Name" 
                        value={formData.store_name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Store Email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        name="address" 
                        placeholder="Store Address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        name="owner_email" 
                        placeholder="Owner Email" 
                        value={formData.owner_email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit">Create Store</button>
            </form>
        </div>
    );
};

export default CreateStorePage;
