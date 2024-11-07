import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { File, Upload, Download } from "lucide-react";

const FileUpload = ({ contract, account }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("No file selected");

  // Upload file to IPFS
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
            pinata_api_key: import.meta.env.VITE_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_API_SECRET,
            "Content-Type": "multipart/form-data",
          },
        });

        const FileHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        const FileName = file.name;
        await contract.add(FileHash, FileName);

        alert("Successfully uploaded file");
        setFileName("No file selected");
        setFile(null);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Unable to upload file to Pinata");
      }
    }
  };

  // Retrieve file from system
  const retrieveFile = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    e.preventDefault();
  };

  // Fetch stored data
  const getdata = async () => {
    let dataArray;
    try {
      dataArray = await contract.display(account);
      //console.log("Data fetched:", dataArray);
    } catch (error) {
      console.error("Access error:", error);
      alert("You don't have access");
      return;
    }

    if (dataArray && dataArray.length > 0) {
      const downloadLinks = dataArray.map((item, index) => (
        <div key={index} className="mb-2">
          <a
            href={item.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {item.name}
          </a>
        </div>
      ));
      setData(downloadLinks);
    } else {
      alert("No files to display");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upload files to your repository
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            Add files to your repository and retrieve them when needed
          </p>
        </motion.div>
        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Upload File
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <File className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={retrieveFile}
                              disabled={!account}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                    {fileName && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected file: {fileName}
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={!file}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Retrieve Files
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={getdata}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Get Data
                  </motion.button>
                  <div className="mt-4">
                    {data.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Available Files:
                        </h4>
                        <ul className="divide-y divide-gray-200">
                          {data.map((file, index) => (
                            <li key={index} className="py-2">
                              <div className="flex items-center space-x-4">
                                <File className="h-5 w-5 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">
                        No files available to display.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
