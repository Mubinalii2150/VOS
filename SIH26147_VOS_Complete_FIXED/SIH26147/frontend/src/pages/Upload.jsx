import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Upload() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const MAX_SIZE = 100 * 1024 * 1024;

  const validateFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return false;
    }

    const fileName = selectedFile.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".iq") ||
      fileName.endsWith(".wav");

    if (!validExtension) {
      setError(
        "Please select a valid .IQ or .WAV file."
      );

      return false;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError(
        "File size exceeds the maximum limit of 100 MB."
      );

      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    handleFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please choose an IQ or WAV file first."
      );

      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log(
        "Upload successful:",
        response.data
      );

      if (response.data?.id) {
        navigate(
          `/dashboard?id=${response.data.id}`
        );
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        "Unable to connect to the analysis server. Make sure the Flask backend is running."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">

      {/* ================= NAVBAR ================= */}

      <header className="topbar">

        <div className="brand">

          <span className="brand-name">
            VOS
          </span>

          <span className="brand-code">
            SIH26147
          </span>

        </div>

        <nav className="navigation">

          <Link
            to="/"
            className="nav-link active"
          >
            Upload
          </Link>

          <Link
            to="/dashboard"
            className="nav-link"
          >
            Dashboard
          </Link>

        </nav>

      </header>


      {/* ================= MAIN ================= */}

      <main className="upload-page">

        <section className="hero">

          <div className="hero-eyebrow">
            SMART INDIA HACKATHON
            <span>•</span>
            SIH26147
          </div>


          <h1 className="hero-title">

            <span>
              Signal Intelligence
            </span>

            <span className="gradient-text">
              Analyzer
            </span>

          </h1>


          <p className="hero-description">

            Analyze IQ and WAV captures with FFT,
            spectrograms, modulation, bitstream,
            FEC and interleaving diagnostics.

          </p>


          {/* ================= UPLOAD BOX ================= */}

          <div
            className={`upload-box ${
              dragging ? "dragging" : ""
            } ${
              file ? "has-file" : ""
            }`}
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >

            <input
              ref={fileInputRef}
              type="file"
              accept=".iq,.wav,audio/wav"
              onChange={handleInputChange}
              hidden
            />

            {!file ? (

              <>

                <div className="upload-title">
                  Choose .IQ or .WAV file
                </div>

                <div className="upload-subtitle">
                  Maximum configured upload size:
                  100 MB
                </div>

              </>

            ) : (

              <div className="selected-file">

                <div className="file-icon">
                  ◈
                </div>

                <div className="file-information">

                  <div className="upload-title">
                    {file.name}
                  </div>

                  <div className="upload-subtitle">
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </div>

                </div>

                <button
                  type="button"
                  className="remove-file"
                  onClick={(event) => {
                    event.stopPropagation();

                    setFile(null);

                    if (
                      fileInputRef.current
                    ) {
                      fileInputRef.current.value =
                        "";
                    }
                  }}
                >
                  ×
                </button>

              </div>

            )}

          </div>


          {/* ================= ERROR ================= */}

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}


          {/* ================= BUTTON ================= */}

          <button
            className="analyze-button"
            onClick={handleUpload}
            disabled={
              uploading ||
              !file
            }
          >

            {uploading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                Upload & Analyze
                <span className="arrow">
                  →
                </span>
              </>
            )}

          </button>


          {/* ================= FEATURE STRIP ================= */}

          <div className="feature-strip">

            <div className="feature-item">
              <span className="feature-dot"></span>
              FFT Analysis
            </div>

            <div className="feature-item">
              <span className="feature-dot"></span>
              Spectrogram
            </div>

            <div className="feature-item">
              <span className="feature-dot"></span>
              Modulation
            </div>

            <div className="feature-item">
              <span className="feature-dot"></span>
              FEC
            </div>

            <div className="feature-item">
              <span className="feature-dot"></span>
              Interleaving
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Upload;