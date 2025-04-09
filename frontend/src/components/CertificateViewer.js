import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const CertificateViewer = ({ open, onClose, certification }) => {
  const [error, setError] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (certification?.certificateUrl) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const fullUrl = certification.certificateUrl.startsWith('http') 
        ? certification.certificateUrl 
        : `${baseUrl}${certification.certificateUrl}`;
      setFileUrl(fullUrl);
      setError(false);
    }
  }, [certification]);

  const handleOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    setError(false);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading certificate file:', file.name, 'for certification:', certification._id);
      
      const response = await axios.post(
        `http://localhost:3001/api/certifications/${certification._id}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Upload response:', response.data);
      
      // Update the URL and refresh the view
      if (response.data.certificateUrl) {
        setFileUrl(response.data.certificateUrl);
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          // Force reload to see changes
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(true);
    } finally {
      setUploading(false);
    }
  };

  console.log('Certificate URL:', fileUrl); // Debug log

  const renderCertificate = () => {
    if (!certification?.certificateUrl) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '400px',
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            p: 3
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No Certificate Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This certification does not have an uploaded certificate file.
          </Typography>
        </Box>
      );
    }

    const fileExtension = certification.certificateUrl.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <Box sx={{ width: '100%', height: '600px', position: 'relative' }}>
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            onError={() => {
              console.error('Error loading PDF');
              setError(true);
            }}
          >
            <Typography>
              Unable to display PDF. <Button onClick={handleOpenInNewTab}>Open in new tab</Button>
            </Typography>
          </object>
        </Box>
      );
    } else {
      return (
        <Box sx={{ width: '100%', textAlign: 'center', p: 2 }}>
          <img
            src={fileUrl}
            alt="Certificate"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '600px', 
              objectFit: 'contain',
              border: '1px solid #eee',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              console.error('Error loading image');
              setError(true);
            }}
          />
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        {certification?.title || 'Certificate'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        {certification?.certificateUrl && (
          <IconButton
            aria-label="open in new tab"
            onClick={handleOpenInNewTab}
            sx={{
              position: 'absolute',
              right: 48,
              top: 8,
            }}
          >
            <OpenInNewIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        {/* Blue UPLOAD CERTIFICATE button at the top for consistency with the UI */}
        {!uploading && !error && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <input
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              style={{ display: 'none' }}
              id="upload-certificate-button"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="upload-certificate-button">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' } 
                }}
              >
                UPLOAD CERTIFICATE
              </Button>
            </label>
          </Box>
        )}
        
        {uploadSuccess && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success">
              Certificate uploaded successfully!
            </Alert>
          </Box>
        )}

        {error ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="error" gutterBottom>
              Error loading certificate. Please try opening in a new tab or upload a new certificate.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleOpenInNewTab}
                startIcon={<OpenInNewIcon />}
              >
                Open in New Tab
              </Button>
              
              <input
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                style={{ display: 'none' }}
                id="upload-certificate-file-error"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="upload-certificate-file-error">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  color="secondary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload New Certificate'}
                </Button>
              </label>
            </Box>
          </Box>
        ) : (
          <>
            {renderCertificate()}
            
            {/* Upload button at bottom of dialog */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              {uploadSuccess && (
                <Typography color="success.main">
                  Certificate uploaded successfully!
                </Typography>
              )}
              <input
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                style={{ display: 'none' }}
                id="upload-certificate-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="upload-certificate-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                  color="primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : (certification?.certificateUrl ? 'Replace Certificate' : 'Upload Certificate')}
                </Button>
              </label>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CertificateViewer; 