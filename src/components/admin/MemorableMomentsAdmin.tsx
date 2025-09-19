"use client";

import { useState, useEffect } from "react";
import memorableMomentsData from "@/data/memorableMoments.json";

interface EventPhoto {
  id: string;
  url: string;
  title: string;
  date: string;
  description: string;
  category: string;
}

interface SectionInfo {
  title: string;
  subtitle: string;
  description: string;
}

export default function MemorableMomentsAdmin() {
  const [sectionInfo, setSectionInfo] = useState<SectionInfo>(memorableMomentsData.sectionInfo);
  const [events, setEvents] = useState<EventPhoto[]>(memorableMomentsData.events);
  const [editingEvent, setEditingEvent] = useState<EventPhoto | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSectionInfoChange = (field: keyof SectionInfo, value: string) => {
    setSectionInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleEventChange = (field: keyof EventPhoto, value: string) => {
    if (editingEvent) {
      setEditingEvent(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const saveEvent = () => {
    if (editingEvent) {
      if (isAddingNew) {
        setEvents(prev => [...prev, editingEvent]);
        setIsAddingNew(false);
      } else {
        setEvents(prev => prev.map(event =>
          event.id === editingEvent.id ? editingEvent : event
        ));
      }
      setEditingEvent(null);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const addNewEvent = () => {
    const newEvent: EventPhoto = {
      id: Date.now().toString(),
      url: "",
      title: "",
      date: "",
      description: "",
      category: ""
    };
    setEditingEvent(newEvent);
    setIsAddingNew(true);
  };

  const generateJSON = () => {
    const data = {
      sectionInfo,
      events
    };
    return JSON.stringify(data, null, 2);
  };

  const downloadJSON = () => {
    const dataStr = generateJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'memorableMoments.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Memorable Moments Admin</h1>

          {/* Section Info Editor */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Section Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={sectionInfo.title}
                  onChange={(e) => handleSectionInfoChange('title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={sectionInfo.subtitle}
                  onChange={(e) => handleSectionInfoChange('subtitle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={sectionInfo.description}
                  onChange={(e) => handleSectionInfoChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Events</h2>
              <button
                onClick={addNewEvent}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add New Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded-md mb-3 overflow-hidden">
                    {event.url && (
                      <img
                        src={event.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.category} • {event.date}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Section */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Export Data</h2>
            <div className="flex gap-4">
              <button
                onClick={downloadJSON}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Download JSON
              </button>
              <div className="text-sm text-gray-600">
                <p>Download the JSON file and replace the content in:</p>
                <code className="bg-gray-200 px-2 py-1 rounded">src/data/memorableMoments.json</code>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {isAddingNew ? 'Add New Event' : 'Edit Event'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) => handleEventChange('title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={editingEvent.category}
                        onChange={(e) => handleEventChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="text"
                        value={editingEvent.date}
                        onChange={(e) => handleEventChange('date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={editingEvent.url}
                      onChange={(e) => handleEventChange('url', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) => handleEventChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}