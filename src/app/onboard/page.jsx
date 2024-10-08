"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import axios from "axios"; // Import Axios
import illustration from "../../public/Illustration.png";
import line from "../../public/line.png";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useBountyContract } from "../hooks/useBountyContract";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Onboard() {
  const { address } = useAccount();
  const { contract } = useBountyContract();
  const route = useRouter();
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [userType, setUserType] = useState("User");

  const handleOffsetSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log(e, "Submited");
  };

  // useEffect(() => {
  const getSignature = () => {
    const signature = localStorage.getItem("worldCoinId");
    console.log(signature, "signature");
  };
  // });

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append("file", profilePicture);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfilePictureUrl(response.data.url); // Set the profile picture URL
      console.log("Profile picture uploaded successfully:", response.data.url);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const uploadImagesToCloudinary = async () => {
    let uploadedImages;

    // toast.info("Uploading images...");
    // for (const image of images) {
    const formData = new FormData();
    formData.append("file", profilePicture);
    formData.append("upload_preset", "ml_default");
    formData.append("cloud_name", "dv0frgqvj");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dv0frgqvj/image/upload`,
        formData
      );
      uploadedImages = response.data.secure_url;
    } catch (error) {
      // toast.error("Image upload failed!");
      console.error("Image upload failed:", error);
    }
    // }

    // toast.success("Upload successful!");
    console.log(uploadedImages);
    return { uploadedImages };
  };

  const handleRegisterUser = async () => {
    if (!address) {
      console.error("Wallet address is missing");
      toast.error("Please connect your wallet.");
      return;
    }

    const { uploadedImages } = await uploadImagesToCloudinary();

    try {
      const response = await axios.post(
        "https://bb-backend-eight.vercel.app/api/user/createUser",
        {
          walletAddress: address, // Ensure this value is not undefined
          name: name,
          profilePictureUrl: uploadedImages,
          worldcoinID: localStorage.getItem("worldCoinId"),
        },
        {
          headers: {
            "Content-Type": "application/json", // Use JSON since we're sending a JSON payload
          },
        }
      );

      const worldcoinID = localStorage.getItem("worldCoinId");

      // Call the registerUser function on the smart contract
      const tx = await contract.registerUser(worldcoinID, name, uploadedImages);
      await tx.wait();

      console.log("User registered successfully:", response.data);
      toast.success("User registered successfully!");
      route.push("/bounty-board");
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Error registering user. Please try again.");
    }
  };

  return (
    <div className="bg-black min-h-screen font-poppins text-white">
      <ToastContainer />
      <Navbar />

      <div className="flex flex-col items-center mt-10">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1DE9B6] to-[#EC407A]">
          Welcome Onboard!
        </h2>

        <div className="bg-[#f6f1ee] text-black mt-8 px-10 py-5 rounded-lg max-w-md w-full flex flex-col items-center">
          <Image
            src={illustration}
            alt="Onboarding illustration"
            width={400}
            height={600}
            className="mb-6"
          />

          <div className="w-full">
            <div className="mb-4">
              <label className="block text-lg font-medium">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium">
                Upload Profile Picture:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full p-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleRegisterUser}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:opacity-90 transition"
            >
              Create User
            </button>
          </div>
        </div>
        <div className="flex justify-center my-[100px]">
          <Image src={line} alt="line" width={150} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Onboard;
