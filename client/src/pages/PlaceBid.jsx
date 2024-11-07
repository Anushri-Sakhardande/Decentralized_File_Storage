import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { DollarSign, User, File } from "lucide-react";


const PlaceBid = ({ contract, account }) => {
  const [fileListings, setFileListings] = useState([]);
  const [bidAmounts, setBidAmounts] = useState({});
  const [bidSuccessMessage, setBidSuccessMessage] = useState("");

  // Fetch the list of files and associated accounts
  useEffect(() => {
    const fetchFileListings = async () => {
      try {
        const [userAddresses, allFileNames] = await contract.listAllFiles();
        const listings = userAddresses.map((user, index) => ({
          address: user,
          fileNames: allFileNames[index],
        }));
        setFileListings(listings);
      } catch (error) {
        console.error("Error fetching file listings:", error);
      }
    };
    fetchFileListings();
  }, [contract]);

  // Place a bid on a specific user (account) for all their files
  const handlePlaceBid = async (dataOwnerAddress) => {
    const bidAmount = bidAmounts[dataOwnerAddress];
    if (!bidAmount || bidAmount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    try {
      // Convert bidAmount to a BigNumber (in Wei)
      const bidValue = ethers.utils.parseUnits(bidAmount.toString(), "wei");

      // Call the contract function with dataOwnerAddress and bidValue
      const tx = await contract.placeBid(dataOwnerAddress, bidValue, {
        value: bidValue,
      });
      await tx.wait();
      setBidSuccessMessage(`Bid placed successfully on files from ${dataOwnerAddress}`);
      
      // Clear the bid amount for this address after placing the bid
      setBidAmounts((prev) => ({ ...prev, [dataOwnerAddress]: "" }));
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  };

  // Update bid amount for each address
  const handleBidAmountChange = (address, amount) => {
    setBidAmounts((prev) => ({
      ...prev,
      [address]: amount,
    }));
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
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Place your Bids</h2>
          <p className="mt-3 text-xl text-gray-500">Browse available files and place your bids</p>
        </motion.div>

        {fileListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center"
          >
            <p className="text-gray-500 text-lg">No files available for bidding.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {fileListings.map((listing, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white shadow overflow-hidden sm:rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">User: {listing.address}</h3>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {listing.fileNames.map((fileName, fileIndex) => (
                      <li key={fileIndex} className="flex items-center col-span-1 rounded-md shadow-sm">
                        <div className="flex-shrink-0 flex items-center justify-center w-16 bg-indigo-600 text-white text-sm font-medium rounded-l-md">
                          <File className="h-6 w-6" />
                        </div>
                        <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                          <div className="flex-1 px-4 py-2 text-sm truncate">
                            <p className="text-gray-900 font-medium hover:text-gray-600">
                              {fileName}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 sm:flex sm:items-center">
                    <div className="w-full sm:max-w-xs">
                      <label htmlFor={`bid-${listing.address}`} className="sr-only">
                        Bid amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id={`bid-${listing.address}`}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter bid amount (in Wei)"
                          value={bidAmounts[listing.address] || ""}
                          onChange={(e) => handleBidAmountChange(listing.address, e.target.value)}
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlaceBid(listing.address)}
                      className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Place Bid
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlaceBid;
