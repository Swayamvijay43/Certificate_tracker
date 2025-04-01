import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, User, Home } from "lucide-react";

export default function CertTracker() {
  const [certifications, setCertifications] = useState([
    { id: 1, name: "Full-Stack Web Development", issuer: "Coursera", date: "March 2025", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Machine Learning", issuer: "Udemy", date: "April 2025", image: "https://via.placeholder.com/150" }
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-4 shadow-lg">
        <Avatar className="w-16 h-16 mx-auto" />
        <h2 className="text-center text-lg font-semibold mt-2">Swayam Pagare</h2>
        <p className="text-center text-gray-600">MIT Academy of Engineering</p>
        <p className="text-center text-gray-600 mt-2">Certifications: {certifications.length}</p>
      </aside>
      
      {/* Main Content */}
      <main className="w-3/4 p-6">
        {/* Navbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
          <h1 className="text-xl font-bold">Skill & Certification Tracker</h1>
          <div className="flex space-x-4">
            <Home className="cursor-pointer" />
            <Bell className="cursor-pointer" />
            <MessageSquare className="cursor-pointer" />
            <User className="cursor-pointer" />
          </div>
        </div>
        
        {/* Certification Feed */}
        <div className="space-y-4">
          {certifications.map(cert => (
            <Card key={cert.id} className="p-4 bg-white shadow-md rounded-lg">
              <CardContent className="flex items-center space-x-4">
                <img src={cert.image} alt={cert.name} className="w-16 h-16 rounded-md" />
                <div>
                  <h3 className="text-lg font-semibold">{cert.name}</h3>
                  <p className="text-gray-600">Issued by: {cert.issuer}</p>
                  <p className="text-gray-500 text-sm">Date: {cert.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
