import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { User, File, Download } from 'lucide-react';

function ShowFiles({ contract, account }) {
  const [accessibleOwners, setAccessibleOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [files, setFiles] = useState([]);

  // Fetch list of accessible data owners
  useEffect(() => {
    async function fetchAccessList() {
        //console.log("Fetching access list for", account);

        try {
            // Call the contract to get the list of data owners who have granted access to this account
            const allOwners = await contract.getAccessibleDataOwners();
            
            // Filter out owners with active access
            const ownersWithAccess = allOwners
                .filter(entry => entry.access)
                .map(entry => entry.dataOwner);
            
            //console.log("Owners with active access:", ownersWithAccess);
            setAccessibleOwners(ownersWithAccess);
        } catch (error) {
            console.error("Error fetching access list:", error);
        }
    }

    if (account && contract) {
        fetchAccessList();
    }
}, [account, contract]);

 

  // Fetch files for the selected data owner
  const fetchFilesForOwner = async (ownerAddress) => {
      try {
          const filesArray = await contract.display(ownerAddress);
          setFiles(filesArray);
      } catch (error) {
          console.error("Error fetching files:", error);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Accessible Data Owners</h2>
        <p className="mt-3 text-xl text-gray-500">View and download files from accessible data owners</p>
      </motion.div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Data Owners</h3>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accessibleOwners.map((owner, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchFilesForOwner(owner)}
                  className="w-full inline-flex items-center justify-center wx-8 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white text-wrap bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <User className="mr-2 h-5 w-5" />
                  View Files from {owner}
                </motion.button>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Files</h3>
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <File className="mr-3 h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  </div>
  );
}

export default ShowFiles;
