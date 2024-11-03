import { useEffect } from "react";
const Modal = ({ setModalOpen, contract }) => {
  const sharing = async () => {
    const address = document.querySelector(".address").value;
    await contract.allow(address);
    setModalOpen(false);
  };
  useEffect(() => {
    const accessList = async () => {
      const addressList = await contract.shareAccess();
      let select = document.querySelector("#selectNumber");
      const options = addressList;

      for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        let e1 = document.createElement("option");
        e1.textContent = opt;
        e1.value = opt;
        select.appendChild(e1);
      }
    };
    contract && accessList();
  }, [contract]);
return (
    <>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <div className="text-xl font-semibold mb-4">Share with</div>
                <div className="mb-4">
                    <input
                        type="text"
                        className="address w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter Address"
                    ></input>
                </div>
                <form id="myForm" className="mb-4">
                    <select id="selectNumber" className="w-full p-2 border border-gray-300 rounded">
                        <option className="address">People With Access</option>
                    </select>
                </form>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => {
                            setModalOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button onClick={() => sharing()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Share
                    </button>
                </div>
            </div>
        </div>
    </>
);
};
export default Modal;