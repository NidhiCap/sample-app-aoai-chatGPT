import { Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.css";
import Azure from "../../assets/Azure.svg";
import { Dialog, Stack } from "@fluentui/react";
import { useEffect, useState } from "react";
import {
  TagGroup,
  Tag,
  InteractionTag,
  TagGroupProps,
  InteractionTagPrimary,
  InteractionTagSecondary,
} from "@fluentui/react-tags-preview";

import axios from "axios";
import Dropzone, { FileWithPath } from "react-dropzone";

const Layout = () => {
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState<boolean>(false);
  const [blobs, setBlobs] = useState([]);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const onDrop = (acceptedFiles: FileWithPath[]): void => {
    setFiles([...files, ...acceptedFiles]);
  };

  const removeItem: TagGroupProps["onDismiss"] = (
    _e,
    { dismissedTagValue }
  ) => {
    setBlobs([...blobs].filter((item) => item !== dismissedTagValue));
    const deleted = handleDeleteOne(dismissedTagValue);
    console.log(deleted);
  };

  const uploadFiles = async (): Promise<void> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      await axios
        .post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          setBlobs(response.data);
        });

      setIsUploadPanelOpen(false);
      setError("");
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("Error uploading files");
    }
  };

  const handleDelete = () => {
    console.log("success");
  };

  const handleDeleteAll = async () => {
    try {
      await axios.post("/deleteall", {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("success");
      setBlobs([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleDeleteOne = async (dismissedTagValue: string) => {
    try {
      await axios
        .post(`/delete/${dismissedTagValue}`, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("success", response);
        });
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleUploadClick = () => {
    setIsUploadPanelOpen(true);
  };

  const handleUploadPanelDismiss = () => {
    setIsUploadPanelOpen(false);
    setError("");
  };

  useEffect(() => {
    axios
      .get("/getdata")
      .then((response) => {
        setBlobs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching blobs:", error);
      });
  }, []);

  return (
    <div className={styles.layout}>
      <header className={styles.header} role={"banner"}>
        <div className={styles.headerContainer}>
          <Stack horizontal verticalAlign="center">
            <img src={Azure} className={styles.headerIcon} aria-hidden="true" />
            <Link to="/" className={styles.headerTitleContainer}>
              <h1 className={styles.headerTitle}>Azure AI</h1>
            </Link>
          </Stack>
          <Stack horizontal verticalAlign="center">
            <div
              className={styles.shareButtonContainer}
              role="button"
              tabIndex={0}
              aria-label="Delete"
              onClick={handleDeleteAll}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? handleDelete() : null
              }
            >
              <span className={styles.shareButtonText}>Delete All</span>
            </div>
            <div
              className={styles.shareButtonContainer}
              role="button"
              tabIndex={0}
              aria-label="Upload"
              onClick={handleUploadClick}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? handleUploadClick() : null
              }
            >
              <span className={styles.shareButtonText}>Upload</span>
            </div>
            <div
              className={styles.shareButtonContainer}
              role="button"
              tabIndex={0}
              aria-label="Upload All"
              onClick={handleDeleteAll}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? handleDeleteAll() : null
              }
            >
              <span className={styles.shareButtonText}>Upload All</span>
            </div>
          </Stack>
        </div>
        <div className={styles.listContainer}>
          <h2 className={styles.title}>List of uploaded documents</h2>
          <TagGroup onDismiss={removeItem} className={styles.tag}>
            {blobs.map((blobs, index) => (
              <InteractionTag key={blobs + index} value={blobs} size="small">
                <InteractionTagPrimary
                  hasSecondaryAction
                  className={styles.bordercolor}
                >
                  {blobs}
                </InteractionTagPrimary>
                <InteractionTagSecondary
                  aria-label="remove"
                  className={styles.removeButton}
                />
              </InteractionTag>
            ))}
          </TagGroup>
        </div>
      </header>
      <Outlet />
      <Dialog
        onDismiss={handleUploadPanelDismiss}
        hidden={!isUploadPanelOpen}
        styles={{
          main: [
            {
              selectors: {
                ["@media (min-width: 480px)"]: {
                  maxWidth: "600px",
                  background: "#FFFFFF",
                  boxShadow:
                    "0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  minHeight: "100px",
                },
              },
            },
          ],
        }}
        dialogContentProps={{
          title: "File Upload",
          showCloseButton: true,
        }}
      >
        <Stack horizontal verticalAlign="center" style={{ gap: "8px" }}>
          <div>
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }: any): JSX.Element => (
                <div {...getRootProps()} className={styles.dropzone}>
                  <input {...getInputProps()} />
                  <p>Drag & drop files here, or click to select files</p>
                </div>
              )}
            </Dropzone>
            <button
              onClick={uploadFiles}
              disabled={files.length === 0}
              className={styles.copyButtonContainer}
            >
              Upload
            </button>
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  {file.name}
                </div>
              ))}
            </div>
            <div className={styles.error}>{error}</div>
          </div>
        </Stack>
      </Dialog>
    </div>
  );
};

export default Layout;
