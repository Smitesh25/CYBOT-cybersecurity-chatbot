import React, { useEffect, useState, ChangeEvent } from "react";
import { Button, Modal } from "@chatui/core";
import removeFile from "../apis/removeFile";
import { CircleLoader, HashLoader } from "react-spinners";
import insertDocument from "../apis/insertDocument";
import fetchDocuments from "../apis/fetchDocuments";
import "../fileUploadModal.css";

const MAX_TITLE_LENGTH = 32;
const MAX_DOC_LENGTH = 150;

function FileUploadModal(props) {
  const { openModal, handleOpenModal } = props;
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshViewer, setRefreshViewer] = useState(false);
  const [documentList, setDocumentList] = useState([]);

  // Get the list on first load
  useEffect(() => {
    fetchDocuments().then((documents) => {
      setDocumentList(documents);
    });
  }, []);

  useEffect(() => {
    if (refreshViewer) {
      setRefreshViewer(false);
      fetchDocuments().then((documents) => {
        setDocumentList(documents);
      });
    }
  }, [refreshViewer]);

  const prepend = (array, value) => {
    const newArray = array.slice();
    newArray.unshift(value);
    return newArray;
  };

  let documentListElems = documentList.map((document) => {
    // TODO - redo trimming using CSS and text-overflow: ellipsis
    const id =
      document.id.length < MAX_TITLE_LENGTH
        ? document.id
        : document.id.substring(0, MAX_TITLE_LENGTH) + "...";
    const text =
      document.text.length < MAX_DOC_LENGTH
        ? document.text
        : document.text.substring(0, MAX_DOC_LENGTH) + "...";
    return (
      <div key={document.id} className="viewer__list__item">
        <p className="viewer__list__title">{id}</p>
        {/* <p className="viewer__list__text">{text}</p> */}
      </div>
    );
  });

  // prepend header
  documentListElems = prepend(
    documentListElems,
    <div key="viewer_title" className="viewer__list__item">
      {/* <p className="viewer__list__header">Custom Documents</p> */}
    </div>
  );

  const changeHandler = (event) => {
    if (event.target && event.target.files) {
      setSelectedFile(event.target.files[0]);
      setIsFilePicked(true);
    }
  };

  const handleSubmission = () => {
    if (selectedFile) {
      setIsLoading(true);
      insertDocument(selectedFile).then(() => {
        setRefreshViewer(true);
        setSelectedFile(undefined);
        setIsFilePicked(false);
        setIsLoading(false);
      });
    }
  };

  function handleClose() {
    fetchDocuments().then((documents) => {
      setDocumentList(documents);
    });
    handleOpenModal(false);
  }

  function handleConfirm() {
    fetchDocuments().then((documents) => {
      setDocumentList(documents);
    });
    handleOpenModal(false);
  }

  async function handleClear() {
    await removeFile();
    fetchDocuments().then((documents) => {
      setDocumentList(documents);
    });
    handleOpenModal(false);
  }

  return (
    <div>
      <Modal
        active={openModal}
        title=""
        showClose={false}
        onClose={handleClose}
        actions={[
          {
            label: "Confirm",
            color: "primary",
            onClick: handleConfirm,
          },
          {
            label: "Clear",
            color: "secondary",
            onClick: handleClear,
          },
          {
            label: "Back",
            onClick: handleClose,
          },
        ]}
      >
        {/* <DocumentTools /> */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
          setRefreshViewer={setRefreshViewer}
        >
          <div className="uploader__input-wrapper">
            <label htmlFor="file-input" className="uploader__input-label">
              Choose a file
            </label>
            <input
              className="uploader__input"
              type="file"
              name="file-input"
              id="file-input"
              accept=".pdf,.txt,.json,.md"
              onChange={changeHandler}
            />
          </div>

          {isFilePicked && selectedFile ? (
            <div className="uploader__details">
              <div className="uploader__details-content">
                <p className="uploader__details-name">{selectedFile.name}</p>
              </div>
            </div>
          ) : null}

          {isFilePicked && !isLoading && (
            <button className="uploader__btn" onClick={handleSubmission}>
              Submit
            </button>
          )}
          {isLoading && (
            <HashLoader color="#ffc233" className="uploader__loader" />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
          className="viewer"
        >
          <div className="viewer__list">
            {documentListElems.length > 0 ? (
              documentListElems
            ) : (
              <div>
                <p className="viewer__list__title">
                  Upload your first document!
                </p>
                <p className="viewer__list__text">
                  You will see the title and content here
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FileUploadModal;
