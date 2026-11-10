
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
  if (!success && !error) return;

  const timer = setTimeout(() => {
    setSuccess("");
    setError("");
  }, 3000);

  return () => clearTimeout(timer);
}, [success, error]);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalNotes, setTotalNotes] = useState(0);

  const [formData, setFormData] = useState({
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
        const currentUser = response.data.user || response.data;

        if (currentUser.role !== "user") {
          navigate("/admin-dashboard");
          return;
        }

        setUser(currentUser);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

 const fetchNotes = async (search = "", page = 1) => {
  try {
    setNotesLoading(true);
    setError("");

    const response = await API.get("/notes", {
      params: {
        search,
        page,
        limit: 6
      }
    });

    setNotes(response.data.data || []);
    setCurrentPage(response.data.page || 1);
    setTotalPages(response.data.pages || 1);
    setTotalNotes(response.data.total || 0);

  } catch (err) {
    setError(
      err.response?.data?.message || "Unable to load notes."
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

      await fetchNotes(searchTerm.trim());
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create note."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (note) => {
    setEditingNoteId(note._id);

    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags?.join(", ") || "",
    });

    setError("");
    setSuccess("");
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    try {
      setSaving(true);

      await API.put(`/notes/${editingNoteId}`, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: tagsArray,
      });

      setEditingNoteId(null);

      setFormData({
        title: "",
        content: "",
        tags: "",
      });

      setSuccess("Note updated successfully!");

      await fetchNotes(searchTerm.trim());
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update note."
      );
    } finally {
      setSaving(false);
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

      await fetchNotes(searchTerm.trim());
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete note."
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchNotes("");
  };

  const handlePreviousPage = () => {
  if (currentPage > 1) {
    fetchNotes(searchTerm.trim(), currentPage - 1);
  }
};

const handleNextPage = () => {
  if (currentPage < totalPages) {
    fetchNotes(searchTerm.trim(), currentPage + 1);
  }
};

  const cancelEdit = () => {
    setEditingNoteId(null);
    setFormData({
      title: "",
      content: "",
      tags: "",
    });
  };

  if (loading) {
    return (
      <div className="user-loading">
        Loading User Dashboard...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="user-layout">

      <aside className="user-sidebar">

        <div className="user-logo">
          Notes Manager
        </div>

        <nav className="user-navigation">
  <button
    className={activePage === "dashboard" ? "active" : ""}
    onClick={() => setActivePage("dashboard")}
  >
    My Dashboard
  </button>

  <button
    className={activePage === "profile" ? "active" : ""}
    onClick={() => setActivePage("profile")}
  >
    My Profile
  </button>
</nav>

        <button
          className="user-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      <main className="user-main">

        <header className="user-topbar">
          <h2>User Dashboard</h2>
          <span>{user.name}</span>
        </header>

        <section className="user-content">
            {activePage === "dashboard" && (
  <>

          <div className="user-welcome">
            <h1>Welcome, {user.name}!</h1>
            <p>Create and manage your personal notes.</p>
          </div>

          {error && (
  <div className="user-toast user-toast-error">
    {error}
  </div>
)}

{success && (
  <div className="user-toast user-toast-success">
    {success}
  </div>
)}

          <div className="user-notes-panel">

            <div className="user-notes-heading">
              <h2>My Notes</h2>

              <button
                className="user-primary-btn"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingNoteId(null);
                  setFormData({
                    title: "",
                    content: "",
                    tags: "",
                  });
                  setError("");
                  setSuccess("");
                }}
              >
                {showForm ? "Cancel" : "+ Create Note"}
              </button>
            </div>

            {showForm && (
              <form
                className="user-note-form"
                onSubmit={handleCreateNote}
              >
                <h3>Create New Note</h3>

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

                <label>Note Content</label>
                <textarea
                  name="content"
                  placeholder="Write your note here..."
                  value={formData.content}
                  onChange={handleChange}
                  rows="5"
                  required
                />

                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="study, JavaScript, work"
                  value={formData.tags}
                  onChange={handleChange}
                />

                <button
                  type="submit"
                  className="user-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Note"}
                </button>
              </form>
            )}

            <form
              className="user-search-form"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                placeholder="Search notes by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button type="submit">
                Search
              </button>

              <button
                type="button"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            </form>

            {notesLoading && (
              <p className="user-empty">Loading notes...</p>
            )}

            {!notesLoading && notes.length === 0 && (
              <div className="user-empty">
                {searchTerm.trim()
                  ? "No matching notes found."
                  : "You haven't created any notes yet."}
              </div>
            )}

            {!notesLoading && notes.length > 0 && (
              <div className="user-notes-grid">

                {notes.map((note) => (
                  <article
                    className="user-note-card"
                    key={note._id}
                  >

                    {editingNoteId === note._id ? (
                      <form
                        className="user-note-form"
                        onSubmit={handleUpdateNote}
                      >
                        <h3>Edit Note</h3>

                        <label>Note Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          minLength="3"
                          maxLength="120"
                          required
                        />

                        <label>Note Content</label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={handleChange}
                          rows="5"
                          required
                        />

                        <label>Tags</label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                        />

                        <button
                          type="submit"
                          className="user-primary-btn"
                          disabled={saving}
                        >
                          {saving ? "Updating..." : "Update Note"}
                        </button>

                        <button
                          type="button"
                          className="user-secondary-btn"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <h3>{note.title}</h3>

                        <p>{note.content}</p>

                        {note.tags?.length > 0 && (
                          <div className="user-note-tags">
                            {note.tags.map((tag, index) => (
                              <span key={`${tag}-${index}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <small>
                          Created:{" "}
                          {new Date(note.createdAt).toLocaleDateString()}
                        </small>

                        <div className="user-note-actions">
                          <button
                            onClick={() => handleEditClick(note)}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}

                  </article>
                ))}

              </div>
            )}
            
            {!notesLoading && totalPages > 1 && (
                <div className="user-pagination">
                    <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || notesLoading}>
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                        {" | "}
                        Total Notes: {totalNotes}
                    </span>
                    <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || notesLoading}>
                        Next
                    </button>
                </div>
            )}

          </div>
                    </>
        )}

        {activePage === "profile" && (
          <div className="user-profile-panel">
            <h2>My Profile</h2>
            <p>View your account information.</p>

            <div className="user-profile-details">
              <div>
                <span>Full Name</span>
                <strong>{user.name || "Not available"}</strong>
              </div>

              <div>
                <span>Email Address</span>
                <strong>{user.email || "Not available"}</strong>
              </div>

              <div>
                <span>Account Role</span>
                <strong>{user.role || "user"}</strong>
              </div>

              <div>
                <span>Joined On</span>
                <strong>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Not available"}
                </strong>
              </div>
            </div>
          </div>
        )}

        </section>

      </main>
    </div>
  );
}

export default UserDashboard;
