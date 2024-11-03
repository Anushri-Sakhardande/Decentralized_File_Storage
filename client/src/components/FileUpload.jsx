import { useState } from "react";
import axios from "axios";
const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `Enter Your Key`,
            pinata_secret_api_key: `Enter Your Secret Key`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        contract.add(account,ImgHash);
        alert("Successfully Image Uploaded");
        setFileName("No image selected");
        setFile(null);
      } catch (e) {
        alert("Unable to upload image to Pinata");
      }
    }
    alert("Successfully Image Uploaded");
    setFileName("No image selected");
    setFile(null);
  };
  const retrieveFile = (e) => {
    const data = e.target.files[0]; //files array of files object
    // console.log(data);
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    e.preventDefault();
  };
return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <form className="bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Image
            </label>
            <input
                disabled={!account}
                type="file"
                id="file-upload"
                name="data"
                onChange={retrieveFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <span className="block text-sm text-gray-500 mt-2">Image: {fileName}</span>
            <button
                type="submit"
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!file}
            >
                Upload File
            </button>
        </form>
    </div>
);
};
export default FileUpload;