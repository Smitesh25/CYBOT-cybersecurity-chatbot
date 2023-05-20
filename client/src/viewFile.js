import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";

function S3FileViewer(props) {
  const [fileURL, setFileURL] = useState("");
  useEffect(() => {
    // Set up AWS credentials and region
    AWS.config.update({
      accessKeyId: "AKIAXVADVZDMCKQ7UTOD",
      secretAccessKey: "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",
      region: "ap-south-1"
    });

    // Create an S3 object
    const s3 = new AWS.S3();

    // Use the Location header as the file name
    const fileName = props.locationHeader;
    console.log(props.locationHeader);
    // Set the parameters for the getObject() method
    const params = {
      Bucket: "cybersecuritychatbot",
      Key: "Screenshot 2023-03-02 at 6.29.10 PM.png"
    };

    // Use the getObject() method to retrieve the file from S3
    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(err, "error in fetching");
      } else {
        // Set the file URL in the state
        console.log(data, "hi");
        //setFileURL(URL.createObjectURL(data.Body));
      }
    });
  }, [props.locationHeader]);

  return (
    <div>
      {fileURL && (
        <iframe
          src={fileURL}
          title={props.locationHeader}
          width="200px"
          height="200px"
        />
      )}
    </div>
  );
}

export default S3FileViewer;
