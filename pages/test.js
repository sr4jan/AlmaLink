import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function TestPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [fetching, setFetching] = useState(false);

  const fetchMessages = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/test-get");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      if (data?.success) {
        setMessages(data.data);
      } else {
        toast.error(data?.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/test-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      if (data?.success) {
        setMessage("");
        fetchMessages();
        toast.success("Message sent successfully! 🚀");
      } else {
        toast.error(data?.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/test-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete message");
      const data = await res.json();
      if (data?.success) {
        fetchMessages();
        toast.success("Message deleted successfully! 🗑️");
      } else {
        toast.error(data?.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  const handleEdit = (id, currentMessage) => {
    setEditingId(id);
    setEditMessage(currentMessage);
  };

  const handleUpdate = async (id) => {
    if (!editMessage.trim()) {
      toast.error("Edited message cannot be empty!");
      return;
    }

    try {
      const res = await fetch("/api/test-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newMessage: editMessage }),
      });
      if (!res.ok) throw new Error("Failed to update message");
      const data = await res.json();
      if (data?.success) {
        setEditingId(null);
        setEditMessage("");
        fetchMessages();
        toast.success("Message updated successfully! ✨");
      } else {
        toast.error(data?.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Toasts renderer */}
      <Toaster position="top-center" reverseOrder={false} />

      <h1>Test Page</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          style={{ padding: "0.5rem", width: "300px" }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="#ffffff" /> : "Send"}
        </button>
      </form>

      <h2>All Messages:</h2>

      {fetching ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages yet. Be the first to add one!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg) => (
            <li
              key={msg._id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              {editingId === msg._id ? (
                <>
                  <input
                    type="text"
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    style={{ padding: "0.25rem", width: "70%" }}
                  />
                  <button
                    onClick={() => handleUpdate(msg._id)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#e67e22",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "0.5rem" }}>{msg.message}</div>
                  <small style={{ color: "#777" }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      onClick={() => handleEdit(msg._id, msg.message)}
                      style={{
                        marginRight: "0.5rem",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      style={{
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
