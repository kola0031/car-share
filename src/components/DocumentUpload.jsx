import { useState } from 'react';
import PropTypes from 'prop-types';
import './DocumentUpload.css';

const DocumentUpload = ({ onUpload, documentType = 'insurance', label, accept = 'image/*,application/pdf', loading = false }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();

        reader.onloadend = async () => {
            try {
                await onUpload({
                    documentType,
                    documentData: reader.result,
                    filename: file.name,
                });
                // Reset after successful upload
                setFile(null);
                setPreview(null);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="document-upload">
            <label className="upload-label">
                {label || `Upload ${documentType}`}
            </label>

            <div className="upload-container">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={loading || uploading}
                    className="file-input"
                />

                {preview && (
                    <div className="preview">
                        <img src={preview} alt="Preview" />
                    </div>
                )}

                {file && !preview && (
                    <div className="file-info">
                        <p>📄 {file.name}</p>
                        <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}

                {file && (
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading || loading}
                        className="btn-upload"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                )}
            </div>
        </div>
    );
};

DocumentUpload.propTypes = {
    onUpload: PropTypes.func.isRequired,
    documentType: PropTypes.string,
    label: PropTypes.string,
    accept: PropTypes.string,
    loading: PropTypes.bool,
};

export default DocumentUpload;
