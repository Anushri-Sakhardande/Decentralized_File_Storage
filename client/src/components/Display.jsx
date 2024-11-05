import { useState } from "react";

const Display = ({ contract, account }) => {
  const [data, setData] = useState(""); // State to store downloadable links
  const [otherAddress, setOtherAddress] = useState(""); // State to store the input address

  const getdata = async () => {
    let dataArray;

    try {
      // Fetch data based on whether an address is entered or not
      if (otherAddress) {
        dataArray = await contract.display(otherAddress);
      } else {
        dataArray = await contract.display(account);
      }
      console.log(dataArray);
    } catch (e) {
      alert("You don't have access");
      return; 
    }

    if (dataArray && dataArray.length > 0) {
      const downloadLinks = dataArray.map((item, i) => (
        <a
          href={`${item}`}
          key={i}
          download 
          target="_blank"
          rel="noopener noreferrer"
          className="download-link"
        >
          File {i + 1}
        </a>
      ));
      setData(downloadLinks);
    } else {
      alert("No files to display");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="mt-4 p-2 border border-gray-300 rounded"
        value={otherAddress}
        onChange={(e) => setOtherAddress(e.target.value)}
      />
      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={getdata}
      >
        Get Data
      </button>
    </>
  );
};

export default Display;
