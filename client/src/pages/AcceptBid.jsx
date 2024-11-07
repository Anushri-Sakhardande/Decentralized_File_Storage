import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion'
import { DollarSign, User, Check } from 'lucide-react'

const AcceptBid = ({ contract, account }) => {
  const [bids, setBids] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all available bids from the contract
  const fetchBids = async () => {
    if (!contract) return;

    try {
      const bidsData = await contract.getBids();
      const parsedBids = bidsData.map((bid, index) => ({
        index,
        dataRequester: bid.dataRequester,
        price: ethers.utils.formatEther(bid.price),
        active: bid.active,
      }));
      setBids(parsedBids);
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  // Accept a specific bid
  const acceptBid = async (bidIndex, bidPrice) => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setIsProcessing(true);

      // Convert the bid price to ether and send it as msg.value
      const tx = await contract.acceptBid(bidIndex);

      await tx.wait();
      alert("Bid accepted successfully!");

      // Refresh the bids list after accepting a bid
      fetchBids();
    } catch (error) {
      console.error("Error accepting bid:", error);
      alert("Failed to accept the bid. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Load bids when component mounts
  useEffect(() => {
    fetchBids();
  }, [contract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Bids
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            Review and accept bids from data requesters
          </p>
        </motion.div>

        {bids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center"
          >
            <p className="text-gray-500 text-lg">No available bids</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {bids.map((bid, index) => (
              bid.active && (
                <motion.div
                  key={bid.index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Data Requester
                          </p>
                          <p className="text-sm text-gray-500">
                            {bid.dataRequester}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Bid Price
                          </p>
                          <p className="text-sm text-gray-500">
                            {bid.price} ETH
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => acceptBid(bid.index, bid.price)}
                        disabled={isProcessing}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Accept Bid
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AcceptBid;
