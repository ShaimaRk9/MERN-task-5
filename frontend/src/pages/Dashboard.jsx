
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const [editingNoteId, setEditingNoteId] = useState(null);

const [editFormData, setEditFormData] = useState({
  title: "",
  content: "",
  tags: "",
});

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user || response.data);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      setError("");

      const response = await API.get("/notes");
      setNotes(response.data.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load notes."
      );
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    try {
      setSaving(true);

      await API.post("/notes", {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: tagsArray,
      });

      setFormData({
        title: "",
        content: "",
        tags: "",
      });

      setShowForm(false);
      setSuccess("Note created successfully!");

      await fetchNotes();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to create note."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (note) => {
  setEditingNoteId(note._id);

  setEditFormData({
    title: note.title,
    content: note.content,
    tags: note.tags?.join(", ") || "",
  });

  setError("");
  setSuccess("");
};

const handleEditChange = (e) => {
  setEditFormData({
    ...editFormData,
    [e.target.name]: e.target.value,
  });
};

const handleUpdateNote = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  const tagsArray = editFormData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  try {
    await API.put(`/notes/${editingNoteId}`, {
      title: editFormData.title.trim(),
      content: editFormData.content.trim(),
      tags: tagsArray,
    });

    setEditingNoteId(null);

    setEditFormData({
      title: "",
      content: "",
      tags: "",
    });

    setSuccess("Note updated successfully!");

    await fetchNotes();
  } catch (error) {
    setError(
      error.response?.data?.message || "Unable to update note."
    );
  }
};

const handleDeleteNote = async (noteId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this note?"
  );

  if (!confirmDelete) return;

  setError("");
  setSuccess("");

  try {
    await API.delete(`/notes/${noteId}`);

    setSuccess("Note deleted successfully!");

    await fetchNotes();
  } catch (error) {
    setError(
      error.response?.data?.message || "Unable to delete note."
    );
  }
};

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="dashboard-container">

      <header className="dashboard-header">
        <h2>Notes Management System</h2>

        <div className="dashboard-user">
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">

        <h1>Welcome, {user.name}!</h1>

        <p className="dashboard-subtitle">
          {isAdmin
            ? "Admin Panel - Manage all users' notes."
            : "Manage your personal notes."}
        </p>

        <section className="dashboard-panel">

          <div className="notes-heading">
            <h2>{isAdmin ? "All Users' Notes" : "My Notes"}</h2>

            {!isAdmin && (
              <button
                className="create-note-btn"
                onClick={() => {
                  setShowForm(!showForm);
                  setError("");
                  setSuccess("");
                }}
              >
                {showForm ? "Cancel" : "+ Create Note"}
              </button>
            )}
          </div>

          {success && (
            <p className="dashboard-success">{success}</p>
          )}

          {error && (
            <p className="dashboard-error">{error}</p>
          )}

          {!isAdmin && showForm && (
            <form
              className="note-form"
              onSubmit={handleCreateNote}
            >
              <h3>Create New Note</h3>

              <div className="note-form-field">
                <label>Note Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter note title"
                  value={formData.title}
                  onChange={handleChange}
                  minLength="3"
                  maxLength="120"
                  required
                />
              </div>

              <div className="note-form-field">
                <label>Note Content</label>
                <textarea
                  name="content"
                  placeholder="Write your note here..."
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  required
                />
              </div>

              <div className="note-form-field">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="Example: study, JavaScript, work"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <small>Separate multiple tags with commas.</small>
              </div>

              <button
                type="submit"
                className="create-note-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Note"}
              </button>
            </form>
          )}

          {notesLoading && <p>Loading notes...</p>}

          {!notesLoading && notes.length === 0 && (
            <div className="dashboard-empty">
              {isAdmin
                ? "No notes have been created yet."
                : "You haven't created any notes yet."}
            </div>
          )}

          {!notesLoading && notes.length > 0 && (
            <div className="notes-list">
              {notes.map((note) => (
               <article className="note-card" key={note._id}>
  {editingNoteId === note._id ? (
    <form onSubmit={handleUpdateNote} className="note-form">
      <h3>Edit Note</h3>

      <div className="note-form-field">
        <label>Note Title</label>
        <input
          type="text"
          name="title"
          value={editFormData.title}
          onChange={handleEditChange}
          minLength="3"
          maxLength="120"
          required
        />
      </div>

      <div className="note-form-field">
        <label>Note Content</label>
        <textarea
          name="content"
          value={editFormData.content}
          onChange={handleEditChange}
          rows="6"
          required
        />
      </div>

      <div className="note-form-field">
        <label>Tags</label>
        <input
          type="text"
          name="tags"
          value={editFormData.tags}
          onChange={handleEditChange}
          placeholder="Separate tags with commas"
        />
      </div>

      <button type="submit" className="create-note-btn">
        Update Note
      </button>

      <button
        type="button"
        onClick={() => setEditingNoteId(null)}
      >
        Cancel
      </button>
    </form>
  ) : (
    <>
      <h3>{note.title}</h3>

      <p>{note.content}</p>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, index) => (
            <span key={`${tag}-${index}`}>{tag}</span>
          ))}
        </div>
      )}

      {isAdmin && note.owner && (
        <p className="note-owner">
          Created by: {note.owner.name}
        </p>
      )}

      <small>
        Created: {new Date(note.createdAt).toLocaleDateString()}
      </small>

      <div className="note-actions">
        {!isAdmin && (
          <button onClick={() => handleEditClick(note)}>
            Edit
          </button>
        )}

        <button onClick={() => handleDeleteNote(note._id)}>
          Delete
        </button>
      </div>
    </>
  )}
</article>
              ))}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default Dashboard;
