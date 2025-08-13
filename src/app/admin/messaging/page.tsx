"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RCSMessage {
  id: string;
  title: string;
  content: string;
  richContent?: string;
  messageType: string;
  status: string;
  targetAudience: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  recipients: Array<{
    id: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  deliveryReports: Array<{
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }>;
}

interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  richContent?: string;
  messageType: string;
  category: string;
  isActive: boolean;
}

export default function AdminRCSMessaging() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RCSMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<RCSMessage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const [messageForm, setMessageForm] = useState({
    title: "",
    content: "",
    messageType: "TEXT",
    targetAudience: "ALL_USERS",
    scheduledAt: "",
    richContent: "",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    content: "",
    messageType: "TEXT",
    category: "GENERAL",
    richContent: "",
  });

  const messageTypes = {
    TEXT: "Text Message",
    RICH_TEXT: "Rich Text",
    IMAGE: "Image",
    VIDEO: "Video",
    CARD: "Card",
    CAROUSEL: "Carousel",
    QUICK_REPLY: "Quick Reply",
    SUGGESTION: "Suggestion",
  };

  const audienceTypes = {
    ALL_USERS: "All Users",
    LEADS_ONLY: "Leads Only",
    SALES_MANAGERS: "Sales Managers",
    PROPERTY_INQUIRERS: "Property Inquirers",
    ACTIVE_USERS: "Active Users",
    CUSTOM_LIST: "Custom List",
  };

  const templateCategories = {
    GENERAL: "General",
    MARKETING: "Marketing",
    NOTIFICATION: "Notification",
    WELCOME: "Welcome",
    PROPERTY_UPDATE: "Property Update",
    APPOINTMENT: "Appointment",
    FOLLOW_UP: "Follow Up",
  };

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    SENDING: "bg-yellow-100 text-yellow-800",
    SENT: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    loadMessages();
    loadTemplates();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/messaging/messages');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/messaging/templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedMessage ? 'PUT' : 'POST';
      const url = selectedMessage 
        ? `/api/admin/messaging/messages/${selectedMessage.id}`
        : '/api/admin/messaging/messages';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...messageForm,
          createdById: user?.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowMessageModal(false);
        setSelectedMessage(null);
        resetMessageForm();
        await loadMessages();
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = selectedTemplate ? 'PUT' : 'POST';
      const url = selectedTemplate 
        ? `/api/admin/messaging/templates/${selectedTemplate.id}`
        : '/api/admin/messaging/templates';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...templateForm,
          createdById: user?.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowTemplateModal(false);
        setSelectedTemplate(null);
        resetTemplateForm();
        await loadTemplates();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const sendMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messaging/messages/${messageId}/send`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scheduleMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messaging/messages/${messageId}/schedule`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMessages();
      }
    } catch (error) {
      console.error("Error scheduling message:", error);
    }
  };

  const editMessage = (message: RCSMessage) => {
    setSelectedMessage(message);
    setMessageForm({
      title: message.title,
      content: message.content,
      messageType: message.messageType,
      targetAudience: message.targetAudience,
      scheduledAt: message.scheduledAt ? message.scheduledAt.split('T')[0] + 'T' + message.scheduledAt.split('T')[1].slice(0, 5) : "",
      richContent: message.richContent || "",
    });
    setShowMessageModal(true);
  };

  const editTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      content: template.content,
      messageType: template.messageType,
      category: template.category,
      richContent: template.richContent || "",
    });
    setShowTemplateModal(true);
  };

  const useTemplate = (template: MessageTemplate) => {
    setSelectedMessage(null);
    setMessageForm({
      title: template.name,
      content: template.content,
      messageType: template.messageType,
      targetAudience: "ALL_USERS",
      scheduledAt: "",
      richContent: template.richContent || "",
    });
    setShowMessageModal(true);
  };

  const resetMessageForm = () => {
    setMessageForm({
      title: "",
      content: "",
      messageType: "TEXT",
      targetAudience: "ALL_USERS",
      scheduledAt: "",
      richContent: "",
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      content: "",
      messageType: "TEXT",
      category: "GENERAL",
      richContent: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">RCS Messaging</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RCS Messaging</h1>
          <p className="text-gray-600">Create and manage rich messaging campaigns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedTemplate(null);
              resetTemplateForm();
              setShowTemplateModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Create Template
          </button>
          <button
            onClick={() => {
              setSelectedMessage(null);
              resetMessageForm();
              setShowMessageModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Message
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("messages")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "messages"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "templates"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">RCS Messages</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{message.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[message.status as keyof typeof statusColors]
                      }`}>
                        {message.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {messageTypes[message.messageType as keyof typeof messageTypes]}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Audience</p>
                        <p className="text-gray-600">
                          {audienceTypes[message.targetAudience as keyof typeof audienceTypes]}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">Recipients</p>
                        <p className="text-gray-600">{message.recipients.length}</p>
                      </div>
                      
                      {message.deliveryReports.length > 0 && (
                        <>
                          <div>
                            <p className="font-medium text-gray-900">Delivery Rate</p>
                            <p className="text-gray-600">{message.deliveryReports[0].deliveryRate}%</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-900">Open Rate</p>
                            <p className="text-gray-600">{message.deliveryReports[0].openRate}%</p>
                          </div>
                        </>
                      )}
                    </div>

                    {message.scheduledAt && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Scheduled for:</strong> {formatDate(message.scheduledAt)}</p>
                      </div>
                    )}

                    {message.sentAt && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Sent at:</strong> {formatDate(message.sentAt)}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => editMessage(message)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    
                    {message.status === 'DRAFT' && (
                      <button
                        onClick={() => sendMessage(message.id)}
                        className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                      >
                        Send Now
                      </button>
                    )}
                    
                    {message.status === 'DRAFT' && (
                      <button
                        onClick={() => scheduleMessage(message.id)}
                        className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                      >
                        Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No messages found. Create your first RCS message!</p>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Message Templates</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {templateCategories[template.category as keyof typeof templateCategories]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {messageTypes[template.messageType as keyof typeof messageTypes]}
                      </span>
                    </div>
                    
                    {template.description && (
                      <p className="text-gray-600 mb-2">{template.description}</p>
                    )}
                    
                    <p className="text-gray-600 line-clamp-2">{template.content}</p>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => useTemplate(template)}
                      className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                    >
                      Use Template
                    </button>
                    
                    <button
                      onClick={() => editTemplate(template)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No templates found. Create your first message template!</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-semibold text-gray-900">{messages.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent Messages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messages.filter(m => m.status === 'SENT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-semibold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messages.filter(m => m.status === 'SCHEDULED').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMessage ? 'Edit Message' : 'Create New Message'}
                </h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={messageForm.title}
                      onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                    <select
                      value={messageForm.messageType}
                      onChange={(e) => setMessageForm({ ...messageForm, messageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(messageTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      value={messageForm.targetAudience}
                      onChange={(e) => setMessageForm({ ...messageForm, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(audienceTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={messageForm.scheduledAt}
                      onChange={(e) => setMessageForm({ ...messageForm, scheduledAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {(messageForm.messageType === 'RICH_TEXT' || messageForm.messageType === 'CARD') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rich Content (JSON)</label>
                    <textarea
                      value={messageForm.richContent}
                      onChange={(e) => setMessageForm({ ...messageForm, richContent: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='{"buttons": [{"text": "Learn More", "action": "open_url", "url": "https://example.com"}]}'
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessageModal(false);
                      setSelectedMessage(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {selectedMessage ? 'Update' : 'Create'} Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(templateCategories).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                    <select
                      value={templateForm.messageType}
                      onChange={(e) => setTemplateForm({ ...templateForm, messageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(messageTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {(templateForm.messageType === 'RICH_TEXT' || templateForm.messageType === 'CARD') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rich Content (JSON)</label>
                    <textarea
                      value={templateForm.richContent}
                      onChange={(e) => setTemplateForm({ ...templateForm, richContent: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='{"buttons": [{"text": "Learn More", "action": "open_url", "url": "https://example.com"}]}'
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    {selectedTemplate ? 'Update' : 'Create'} Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}