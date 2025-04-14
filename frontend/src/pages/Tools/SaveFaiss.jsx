import React, { useState } from "react";
import axios from "axios";

const SaveFaiss = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const API_URL = import.meta.env.VITE_FLASK_URL;

    const handleFAISSUpload = async () => {
        if (!selectedFile) {
            setUploadMessage("⚠️ Please select a PDF file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", selectedFile);

        try {
            setIsUploading(true);
            const response = await axios.post(
                `${API_URL}/build-faiss/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setUploadMessage(
                `✅ FAISS index created with ${response.data.chunks_indexed} chunks!`
            );
        } catch (error) {
            console.error("Upload error:", error);
            setUploadMessage("❌ Error uploading file or building FAISS index.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Save FAISS Index</h2>

            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-3"
            />

            <button
                onClick={handleFAISSUpload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={isUploading}
            >
                {isUploading ? "Uploading..." : "Upload & Build"}
            </button>

            {uploadMessage && (
                <p className="mt-3 text-sm text-gray-700">{uploadMessage}</p>
            )}
        </div>
    );
};

export default SaveFaiss;
