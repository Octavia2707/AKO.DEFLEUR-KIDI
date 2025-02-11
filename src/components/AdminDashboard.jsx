import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore"; 

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]); 
  const [imageUrl, setImageUrl] = useState(""); 
  const [itemImageUrl, setItemImageUrl] = useState(""); 
  const [packageName, setPackageName] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [price, setPrice] = useState(""); 
  const [items, setItems] = useState([]); 
  const adminEmails = ["adminako83@gmail.com"]; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (adminEmails.includes(user.email)) {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    });

    const fetchTestimonials = async () => {
      const querySnapshot = await getDocs(collection(db, "testimonials"));
      const testimonialsData = querySnapshot.docs.map((doc) => doc.data());
      setTestimonials(testimonialsData);
    };

    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsData = querySnapshot.docs.map((doc) => doc.data());
      setItems(itemsData);
    };

    fetchTestimonials();
    fetchItems();

    return () => unsubscribe();
  }, []);

  const handleAddTestimonial = async () => {
    if (imageUrl) {
      try {
        await addDoc(collection(db, "testimonials"), { imageUrl });
        const querySnapshot = await getDocs(collection(db, "testimonials"));
        const testimonialsData = querySnapshot.docs.map((doc) => doc.data());
        setTestimonials(testimonialsData);
        setImageUrl(""); 
        alert("Testimoni berhasil ditambahkan!");
      } catch (error) {
        console.error("Gagal mengompresi gambar:", error);
        alert("Gagal mengompresi gambar");
      }
    } else {
      alert("Harap pilih gambar terlebih dahulu.");
    }
  };

  const handleEditTestimonial = async (id, newImageUrl) => {
    if (isAdmin) {
      const testimonialRef = doc(db, "testimonials", id);
      await updateDoc(testimonialRef, { imageUrl: newImageUrl });
      const querySnapshot = await getDocs(collection(db, "testimonials"));
      const testimonialsData = querySnapshot.docs.map((doc) => doc.data());
      setTestimonials(testimonialsData);
      alert("Testimoni berhasil diperbarui!");
    } else {
      alert("Hanya admin yang dapat mengedit testimoni.");
    }
  };

  const handleAddItem = async () => {
    if (packageName && description && price && itemImageUrl) {
      try {
        const newItem = {
          packageName,
          description,
          price,
          imageUrl: itemImageUrl, 
        };
        await addDoc(collection(db, "items"), newItem);
        alert("Item berhasil ditambahkan!");
        setPackageName("");
        setDescription("");
        setPrice("");
        setItemImageUrl("");
      } catch (error) {
        console.error("Gagal mengompresi gambar item:", error);
      }
    } else {
      alert("Semua kolom harus diisi untuk menambahkan item.");
    }
  };

  const handleEditItem = async (id) => {
    if (isAdmin) {
      if (itemImageUrl) {
        const itemRef = doc(db, "items", id);
        await updateDoc(itemRef, { imageUrl: itemImageUrl });
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsData = querySnapshot.docs.map((doc) => doc.data());
        setItems(itemsData);
        alert("Item berhasil diperbarui!");
      } else {
        alert("Harap pilih gambar terlebih dahulu.");
      }
    } else {
      alert("Hanya admin yang dapat mengedit item.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-center text-2xl mt-6">Testimonial List</h1>
        <div className="grid grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={testimonial.imageUrl}
                alt={`Testimonial ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCF5ED] min-h-screen flex flex-col items-center p-8 relative">
      

      

      {/* Add Testimoni */}
      <div className="mt-12 w-full flex flex-col items-start">
        <h2 className="text-xl font-bold font-Judson text-black mb-4">Add Testimoni</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="file"
            accept="image/*"
            className="border-2 border-[#BBBBBB] rounded-lg px-4 py-2 mb-4 w-64"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImageUrl(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
          {imageUrl && (
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
              <img src={imageUrl} alt="Testimonial" className="w-full h-full object-cover" />
            </div>
          )}
          {isAdmin && (
            <button
              className="mt-4 bg-[#CE5A67] font-Judson text-white px-4 py-2 rounded-lg"
              onClick={handleAddTestimonial}
            >
              Add Testimonial
            </button>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold font-Judson text-black mb-4">Testimonial List</h2>
          <div className="grid grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src={testimonial.imageUrl}
                  alt={`Testimonial ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Item */}
      <div className="mt-12 w-full flex flex-col items-start">
        <h2 className="text-xl font-bold font-Judson text-black mb-4">Add Item</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <div className="flex flex-col w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Package Name"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="border-2 border-[#BBBBBB] rounded-lg px-4 py-2 mb-4 w-full"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-[#BBBBBB] rounded-lg px-4 py-2 mb-4 w-full"
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border-2 border-[#BBBBBB] rounded-lg px-4 py-2 mb-4 w-full"
            />
            <input
              type="file"
              accept="image/*"
              className="border-2 border-[#BBBBBB] rounded-lg px-4 py-2 mb-4 w-full"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setItemImageUrl(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {itemImageUrl && (
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                <img src={itemImageUrl} alt="Item" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex flex-col w-full sm:w-1/2">
            {isAdmin && (
              <button
                className="mt-4 bg-[#CE5A67] font-Judson text-white px-4 py-2 rounded-lg"
                onClick={handleAddItem}
              >
                Add Item
              </button>
            )}
            <div className="mt-12">
              <h2 className="text-xl font-bold font-Judson text-black mb-4">Item List</h2>
              <div className="grid grid-cols-3 gap-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={item.imageUrl}
                      alt={`Item ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <h3 className="text-lg font-semibold mt-2">{item.packageName}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm font-bold mt-2">{item.price}</p>
                    {isAdmin && (
                      <button
                        className="mt-2 bg-[#CE5A67] font-Judson text-white px-4 py-2 rounded-lg"
                        onClick={() => handleEditItem(item.id)}
                      >
                        Edit Item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;