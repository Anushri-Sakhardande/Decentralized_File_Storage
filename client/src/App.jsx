import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import {
  Upload,
  Download,
  DollarSign,
  FileText,
  User,
  UserPlus,
} from "lucide-react";
import Storage from "./artifacts/contracts/StorageMarketplace.sol/StorageMarketplace.json";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import FileUpload from "./pages/FileUpload";
import ShowFile from "./pages/ShowFiles";
import PlaceBid from "./pages/PlaceBid";
import AcceptBid from "./pages/AcceptBid";

function App() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        let contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"; //‼️check everytime 

        const contract = new ethers.Contract(
          contractAddress,
          Storage.abi,
          signer
        );
        setContract(contract);
        setProvider(provider);

        // Check the current role from the contract
        checkUserRole(contract);
      } else {
        console.error("MetaMask is not installed");
      }
    };
    loadProvider();
  }, []);

  const checkUserRole = async (contract) => {
    try {
      const [isDataOwner, isDataRequester] = await contract.getRole();
      if (isDataOwner) {
        setRole("Data Owner");
      } else if (isDataRequester) {
        setRole("Requester");
      } else {
        setRole(""); // No role set
      }
    } catch (error) {
      console.error("Error fetching role from contract:", error);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setRole(selectedRole);
    try {
      if (selectedRole === "Data Owner") {
        await contract.registerAsDataOwner();
      } else if (selectedRole === "Requester") {
        await contract.registerAsDataRequester();
      }
      //console.log(`Registered as ${selectedRole}`);
    } catch (error) {
      console.error(`Error registering as ${selectedRole}:`, error);
      alert(`Error registering as ${selectedRole}. Please try again.`);
    }
  };

  return (
    <div>
      <Router>
        <div className=" bg-gradient-to-br from-gray-50 to-gray-100 py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Decentralised File Sharing Marketplace
              </h1>
              <p className="mt-5 text-xl text-gray-500">
                Account: {account || "Not connected"}
              </p>
            </motion.div>

            {role ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Role: <span className="text-indigo-600">{role}</span>
                    </h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      {role === "Data Owner" ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Link
                            to="/accept-bid"
                            className="px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center"
                            >
                              <DollarSign className="mr-2 h-5 w-5" />
                              Accept Bids
                            </motion.button>
                          </Link>
                          <Link
                            to="/file-upload"
                            className="px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center"
                            >
                              <Upload className="mr-2 h-5 w-5" />
                              File Upload
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Link
                            to="/place-bid"
                            className="px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center"
                            >
                              <DollarSign className="mr-2 h-5 w-5" />
                              Place Bid
                            </motion.button>
                          </Link>
                          <Link
                            to="/show-files"
                            className="px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center"
                            >
                              <FileText className="mr-2 h-5 w-5" />
                              Show my Files
                            </motion.button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Select Your Role
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleRoleSelection("Data Owner")}
                      >
                        <User className="mr-2 h-5 w-5" />
                        Register as Data Owner
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => handleRoleSelection("Requester")}
                      >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Register as Requester
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Routes>
          <Route
            path="/accept-bid"
            element={role === "Data Owner" ? <AcceptBid contract={contract} account={account}/> : <Navigate to="/" />}
          />
          <Route
            path="/file-upload"
            element={
              role === "Data Owner" ? <FileUpload contract={contract} account={account}/> : <Navigate to="/" />
            }
          />
          <Route
            path="/place-bid"
            element={role === "Requester" ? <PlaceBid contract={contract} account={account}/> : <Navigate to="/" />}
          />
          <Route
            path="/show-files"
            element={role === "Requester" ? <ShowFile contract={contract} account={account}/> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
